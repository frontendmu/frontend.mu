import { ref, computed, type Ref } from "vue";
import { getCookieValue, DIRECTUS_URL, mapToValidUser, base64Url } from './../utils/helpers';
import { createDirectus, rest, readMe, staticToken, authentication, updateItem, createItem, updateMe, readItems } from '@directus/sdk';

import type { Attendee, RSVPMetaData, RSVPResponse, SiteToast, User } from "../utils/types";
import type { DirectusAstroUser } from './../utils/types';
import type { AuthenticationData, DirectusClient, AuthenticationClient, RestClient, DirectusUser } from '@directus/sdk';

const DIRECTUS_PROJECT_URL = DIRECTUS_URL()

let isAuth = ref(false);
let user = ref<User | null>(null);
let rawUser = ref<DirectusAstroUser | null>(null);
let responseFromServer = ref<any>(null);
let isLoading = ref(false);
let meetupAttendees: Ref<Record<string, Attendee[]>> = ref({});

let toastMessage = ref<SiteToast>({
    title: undefined,
    message: undefined,
    type: undefined,
    visible: false,
})

export function getClient() {
    return createDirectus(DIRECTUS_PROJECT_URL).with(authentication()).with(rest());
}

export function useToast() {
    function show(message: SiteToast) {
        toastMessage.value = message
    }

    function hide() {
        toastMessage.value.visible = false
    }

    const isVisible = computed(() => {
        return toastMessage.value.visible
    })

    return {
        toastMessage,
        isVisible,
        show,
        hide
    }
}

export default function useAuth(client: DirectusClient<any> & AuthenticationClient<any> & RestClient<any>) {

    async function logout() {
        logoutCookie()
        user.value = null;
        isAuth.value = false;
        responseFromServer.value = null;
    }

    function handleError(error) {
        responseFromServer.value = error;
    }

    function setCookie(authData: AuthenticationData) {
        document.cookie = `access_token=${authData.access_token}; expires=${new Date(authData.expires_at ?? '').toUTCString()}; path=/`;
    }

    function setCurrentUser(data: User) {
        user.value = data;
    }

    function logoutCookie() {
        // set cookie logic
        document.cookie = `access_token=; expires=${new Date().toUTCString()}; path=/`;
    }

    function filterAttendees(result: Attendee[]) {
        return result.filter(attendee => attendee.name !== null).filter(attendee => attendee.is_public);
    }

    async function loginWithUsernameAndPassword(email: string, password: string) {
        try {

            isLoading.value = true;
            const result = await client.login(email, password);
            isLoading.value = false;
            responseFromServer.value = result;

            if (result.access_token && result.expires_at) {
                setCookie(result)
            }

            getCurrentUser()

            setAuth(true)

            useToast().show({
                title: "Success!",
                message: "User is logged in",
                type: "SUCCESS",
                visible: true
            })



            return result

        } catch (error) {
            console.log(error)
        }
    }

    async function loginWithSSO() {
        try {
            const res = await fetch(
                "https://directus.coders.mu/auth/refresh",
                {
                    method: "POST",
                    credentials: "include", // this is required in order to send the refresh token cookie
                    body: JSON.stringify({
                        refresh_token: getCookieValue('directus_session_token'),
                    }),
                },
            );

            const response: { data: AuthenticationData } = await res.json();

            setCookie(response.data);
            await getCurrentUser()
            setAuth(true)
            if (!rawUser.value?.profile_picture) {
                let picture = await cloudFunctionUpdateProfilePicture(rawUser.value?.id)
                console.log(picture)
            }

            return response.data;
        } catch (error) {
            console.error('Could not get access token from refresh token')
            console.log(error)
        }
    }

    const isLoggedIn = computed(() => {
        return !!isAuth.value;
    })

    function setAuth(value: boolean) {
        if (value === false) {
            isLoading.value = false;
        }

        isAuth.value = value;
    }

    async function checkIfLoggedIn() {
        try {
            await getCurrentUser()
            return true
        } catch (error) {
            setAuth(false)
            handleError(error)
        }
    }

    async function getCurrentUser() {

        const ACCOUNT_SETTINGS_FIELDS = [
            "id",
            "first_name",
            "last_name",
            "full_name",
            "email",
            "phone",
            "transport",
            "meal",
            "occupation",
            "github_username",
            "Events.Events_id.id",
            "Events.Events_id.title",
            "profile_picture",
            "role.name",
        ]

        try {

            const token = getCookieValue('access_token')

            if (!token) {
                throw new Error('User is not logged in')
            }

            client = await client.with(staticToken(token))

            const result = await client.request(readMe({
                fields: ACCOUNT_SETTINGS_FIELDS
            }));

            setAuth(true)
            rawUser.value = result;

            setCurrentUser(mapToValidUser(result));

        } catch (error) {
            handleError(error)
            throw new Error(error)
        }

    }

    const currentEventsRSVP = computed(() => {
        return rawUser.value?.Events?.map((event) => {
            if (typeof event.Events_id === 'string') {
                return { "Events_id": event.Events_id }
            }
            return { "Events_id": event.Events_id.id.toString() }
        }) || []
    })

    const avatarUrl = computed(() => {
        if (rawUser.value?.profile_picture) {
            return base64Url(rawUser.value.profile_picture)
        } else if (rawUser.value?.github_username) {
            return `https://github.com/${rawUser.value?.github_username}.png`
        }
        return false;
    })

    function oAuthLogin() {
        const currentPage = new URL(window.location.origin);
        return `${DIRECTUS_URL()}/auth/login/google?redirect=${currentPage}redirect`
    }

    async function updateUserProfile({ profile_updates, }: { profile_updates: DirectusAstroUser, }) {

        try {
            isLoading.value = true;
            const token = getCookieValue('access_token')

            if (!token) {
                isLoading.value = false;
                useToast().show({
                    title: "Session expired",
                    message: "Please login again.",
                    type: "INFO",
                    visible: true,
                })
                throw new Error('User is not logged in')
            }

            client = await client.with(staticToken(token))

            const result = await client.request(updateMe(profile_updates));
            console.log('profile updated')

            await getCurrentUser();
            isLoading.value = false;

        } catch (error) {
            console.log(error)
        }
    }

    async function createRsvp({ eventId, userId }: { eventId: string, userId: string }) {

        let payload = {
            "Events": {
                "create": [{ "directus_users_id": userId, "Events_id": { "id": eventId } }],
                "update": [],
                "delete": []
            }
        }

        // list all events from this user
        const eventList = rawUser.value?.Events || []
        const eventListIds = eventList.map((event: any) => {
            if (typeof event === 'object') {
                return event.Events_id.id
            }
        });

        if (eventListIds.includes(parseInt(eventId))) {
            // console.log('Already RSVPd, skipping')
        } else {
            const result = await fetch(`https://directus.coders.mu/users/me`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "Authorization": `Bearer ${getCookieValue('access_token')}`
                },
                body: JSON.stringify(payload)
            })
        }


    }

    async function cancelRsvp({ currentEventId }: { currentEventId: string }) {
        try {
            isLoading.value = true;
            const token = getCookieValue('access_token')

            if (!token) {
                isLoading.value = false;
                throw new Error('User is not logged in')
            }

            client = await client.with(staticToken(token))

            let eventIds = currentEventsRSVP.value.map(event => event.Events_id);
            let updatedEvents = currentEventsRSVP.value.filter(event => event.Events_id !== currentEventId);

            let data = { Events: updatedEvents }

            if (eventIds.includes(currentEventId)) {
                const confirmNotAttending = confirm('You are already attending this event! Do you want to remove yourself from the list?');
                if (confirmNotAttending) {
                    await client.request(updateMe(data));
                } else {
                    return;
                }
            }

            await getCurrentUser();
            await getListOfAttendeees(currentEventId);
            isLoading.value = false;

            console.log('rsvp cancelled')
        } catch (error) {
            console.log(error)
        }
    }

    async function getRsvp({ event_id }: { event_id: string }) {
        try {
            isLoading.value = true;
            const token = getCookieValue('access_token')

            if (!token) {
                isLoading.value = false;
                throw new Error('User is not logged in')
            }

            client = await client.with(staticToken(token))
            await getCurrentUser();

            const query_object = {
                filter: {
                    Events_id: {
                        _eq: event_id
                    },
                    directus_users_id: {
                        _eq: user.value?.id
                    }
                },
                fields: [
                    "name",
                    "transport",
                    "meal",
                    "occupation",
                    "is_public",
                    "verified",
                ]
            }

            const result = await client.request<RSVPResponse[]>(readItems('Events_directus_users', query_object));
            return result

        } catch (error) {
            console.log(error)
        }
    }

    async function updateRsvp({ event_id, rsvp_updates }: { event_id: string, rsvp_updates: RSVPMetaData }) {
        try {
            isLoading.value = true;
            const token = getCookieValue('access_token')

            if (!token) {
                isLoading.value = false;
                throw new Error('User is not logged in')
            }

            client = await client.with(staticToken(token))

            const query_object = {
                filter: {
                    Events_id: {
                        _eq: event_id
                    },
                    directus_users_id: {
                        _eq: user.value?.id
                    }
                }
            }

            const primaryKeyQuery = await client.request(readItems('Events_directus_users', query_object));

            const updates = {
                meta: rsvp_updates.meta,
                meal: rsvp_updates.meal,
                transport: rsvp_updates.transport,
                occupation: rsvp_updates.occupation,
                is_public: rsvp_updates.is_public,
                name: rsvp_updates.name,
                profile_picture: rsvp_updates.profile_picture
            }

            const primaryKey = primaryKeyQuery[0].id

            const updateMetaResult = await client.request(updateItem('Events_directus_users', primaryKey, updates));

            console.log('rsvp updated')

            await getListOfAttendeees(event_id);
            await getCurrentUser();

            isLoading.value = false;
        } catch (error) {
            console.log(error)
        }
    }

    async function cloudFunctionUpdateProfilePicture(userId) {

        const FUNCTION_AUTH_PICTURE_URL = `https://auth-picture.coders.mu/`

        const result = await fetch(FUNCTION_AUTH_PICTURE_URL, {
            method: 'POST',
            headers: {
                'user-id': userId,
                'access-token': getCookieValue('access_token')
            },
        });

        console.log(result);

        useToast().show({
            title: "Success!",
            message: "Profile picture synced successfully",
            type: "SUCCESS",
            visible: true
        })


    }

    async function getListOfAttendeees(currentEventId: string) {

        const token = getCookieValue('access_token')

        if (!token) {
            isLoading.value = false;
            throw new Error('User is not logged in')
        }

        client = await client.with(staticToken(token))

        const query_object = {
            filter: {
                Events_id: {
                    _eq: currentEventId
                },
            },
            fields: [
                "*",
            ]
        }

        try {
            const result = await client.request<Attendee[]>(readItems('Events_directus_users', query_object));
            let attendees = filterAttendees(result);
            meetupAttendees.value[currentEventId] = attendees
            return attendees
        } catch (err) {
            console.log(err)
            throw new Error(err)
        }

    }

    async function updateUserVerification({ user_id, event_id, status }: { user_id: string, event_id: string, status: Boolean }) {
        try {
            isLoading.value = true;
            const token = getCookieValue('access_token')

            if (!token) {
                isLoading.value = false;
                throw new Error('User is not logged in')
            }

            client = await client.with(staticToken(token))

            const query_object = {
                filter: {
                    Events_id: {
                        _eq: event_id
                    },
                    directus_users_id: {
                        _eq: user_id
                    }
                }
            }

            const primaryKeyQuery = await client.request(readItems('Events_directus_users', query_object));

            const updates = {
                verified: status,
            }

            const primaryKey = primaryKeyQuery[0].id

            const updateMetaResult = await client.request<Attendee>(updateItem('Events_directus_users', primaryKey, updates));

            useToast().show({
                title: "Success!",
                message: "User verified successfully",
                type: "SUCCESS",
                visible: true
            })

            // await getListOfAttendeees(event_id);
            // await getCurrentUser();

            isLoading.value = false;

            return updateMetaResult
        } catch (error) {
            useToast().show({
                title: "Oops!",
                message: "Failed to verify the user!",
                type: "ERROR",
                visible: true
            })

            return new Error("You don't have permission for this action")
        }
    }

    return {
        cloudFunctionUpdateProfilePicture,
        loginWithUsernameAndPassword,
        logout,
        isLoggedIn,
        getCurrentUser,
        checkIfLoggedIn,
        rawUser,
        user,
        responseFromServer,
        client,
        loginWithSSO,
        oAuthLogin,
        createRsvp,
        updateRsvp,
        getRsvp,
        updateUserProfile,
        cancelRsvp,
        getListOfAttendeees,
        updateUserVerification,
        currentEventsRSVP,
        isLoading,
        avatarUrl,
        meetupAttendees,
    }
}
