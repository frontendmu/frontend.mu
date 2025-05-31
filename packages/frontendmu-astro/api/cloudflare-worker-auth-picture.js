/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run "npm run dev" in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run "npm run deploy" to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

async function fetchPicture(accessToken, googleClientId, googleClientSecret) {
    const directusApiEndpoint = 'https://directus.coders.mu/users/me';
    let result = await fetch(directusApiEndpoint, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    })
        .then((response) => response.json())
        .then(async (response) => {
            console.log(response)
            const userData = response.data;
            if (userData.auth_data === null) {
                console.log('Authdata is null, this is probably does not have the correct role');
            } else {
                const { refreshToken } = JSON.parse(userData.auth_data)
                console.log('refreshToken: ', refreshToken)

                let accessToken
                try {
                    accessToken = await getAccessTokenFromGoogle(refreshToken, googleClientId, googleClientSecret);
                    console.log('accessToken', accessToken)
                } catch (err) {
                    throw new Error('Could not retrieve access token');
                }

                try {
                    let pp = await getProfilePictureFromGoogle(accessToken)
                    console.log('logging pp')
                    console.log(pp)
                    return pp
                } catch (err) {
                    throw new Error('Could not retrieve profile picture');
                }
            }

        })
        .catch((error) => {
            console.error('Error fetching user data:', error.message);
        });

    return result
}

async function getAccessTokenFromGoogle(refreshToken, googleClientId, googleClientSecret) {
    const tokenEndpoint = 'https://accounts.google.com/o/oauth2/token';
    const formData = new URLSearchParams();

    formData.append('client_id', googleClientId);
    formData.append('client_secret', googleClientSecret);
    formData.append('refresh_token', refreshToken);
    formData.append('grant_type', 'refresh_token');

    console.log(Array.from(formData.entries()));

    try {
        const tokenResponse = await fetch(tokenEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded', // likely needed for refresh tokens
            },
            body: formData
        });

        const tokenData = await tokenResponse.json();
        console.log(tokenData)
        console.log('version 2.4')
        const gAccessToken = tokenData.access_token;
        return gAccessToken;
    } catch (error) {
        console.log(error)
        throw new Error('Could not retrieve access token');
    }
}

async function getProfilePictureFromGoogle(googleAccessToken) {
    const userInfoEndpoint = 'https://www.googleapis.com/oauth2/v1/userinfo';
    const userInfoResponse = await fetch(userInfoEndpoint, {
        headers: {
            'Authorization': `Bearer ${googleAccessToken}`,
        },
    });

    const googleUserInfo = await userInfoResponse.json();
    console.log({ googleUserInfo })
    let imageUrl = googleUserInfo['picture'];

    console.log(`Retrieved profile picture for user ${imageUrl}`)
    return imageUrl;
}

async function uploadImageToDirectus(imageUrl, directusAccessToken, directusUserId) {

    let base64String = await fromUrlToBase64(imageUrl);

    const DIRECTUS_PROJECT_URL = 'https://directus.coders.mu';

    try {
        // Make a POST request to /files in the Directus instance

        const uploadResponse = await fetch(
            `${DIRECTUS_PROJECT_URL}/users/${directusUserId}`,
            {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${directusAccessToken}`,
                },
                body: JSON.stringify({
                    profile_picture: base64String
                }),
            }
        );

        const uploadData = await uploadResponse.json();
        console.log('File uploaded successfully:', uploadData);
    } catch (error) {
        console.error('Error uploading file to Directus:', error.message);
    }
}

async function fromUrlToBase64(imageUrl) {

    let result = await fetch(imageUrl)
        .then(response => response.arrayBuffer())
        .then(buffer => {
            const base64String = btoa(String.fromCharCode(...new Uint8Array(buffer)));
            return base64String
        })
        .catch(error => console.error('Error fetching or converting image:', error));

    return result
}

export default {
    async fetch(req, env, ctx) {

        const userId = req.headers.get('user-id');
        const accessToken = req.headers.get('access-token');

        const googleClientId = env.AUTH_GOOGLE_CLIENT_ID;
        const googleClientSecret = env.AUTH_GOOGLE_CLIENT_SECRET;

        let imageUrl = await fetchPicture(accessToken, googleClientId, googleClientSecret)

        await uploadImageToDirectus(imageUrl, accessToken, userId);

        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET,HEAD,POST,OPTIONS',
            'Access-Control-Max-Age': '86400',
        };

        const init = {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                ...corsHeaders,
                'Access-Control-Allow-Headers': req.headers.get(
                    'Access-Control-Request-Headers'
                ),
            }
        };

        const body = JSON.stringify({
            imageUrl,
        });

        return new Response(body, init);
    },
}