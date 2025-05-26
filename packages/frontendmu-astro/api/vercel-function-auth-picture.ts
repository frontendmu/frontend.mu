import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

// Extract environment variables
const googleClientId = process.env.AUTH_GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.AUTH_GOOGLE_CLIENT_SECRET;


const directusApiEndpoint = 'https://directus.coders.mu/users/me';

async function fetchPicture(accessToken: string) {
	let result = await fetch(directusApiEndpoint, {
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	})
		.then((response: any) => response.json())
		.then(async (response: any) => {
			console.log(response)
			const userData = response.data;
			if (userData.auth_data === null) {
				console.log('Authdata is null, this is probably does not have the correct role');

			} else {
				const { refreshToken } = JSON.parse(userData.auth_data)
				let accessToken

				try {
					accessToken = await getAccessTokenFromGoogle(refreshToken);
				} catch (err) {
					throw new Error('Could not retrieve access token');
				}

				try {
					let pp = await getProfilePictureFromGoogle(accessToken)
					return pp
				} catch (err) {
					throw new Error('Could not retrieve profile picture');
				}
			}

		})
		.catch((error: Error) => {
			console.error('Error fetching user data:', error.message);
		});

	return result
}

async function getAccessTokenFromGoogle(refreshToken: string) {
	const tokenEndpoint = 'https://accounts.google.com/o/oauth2/token';
	try {
		const tokenResponse = await axios.post(tokenEndpoint, null, {
			params: {
				client_id: googleClientId,
				client_secret: googleClientSecret,
				refresh_token: refreshToken,
				grant_type: 'refresh_token',
			},
		});

		const gAccessToken = tokenResponse.data.access_token;
		return gAccessToken;
	} catch (error) {
		console.log(error)
		throw new Error('Could not retrieve access token');
	}
}

async function getProfilePictureFromGoogle(googleAccessToken: string) {
	const userInfoEndpoint = 'https://www.googleapis.com/oauth2/v1/userinfo';
	const userInfoResponse = await axios.get(userInfoEndpoint, {
		params: {
			access_token: googleAccessToken,
		},
	});

	const googleUserInfo = userInfoResponse.data;
	var imageUrl = googleUserInfo['picture'];

	// console.log(`Retrieved profile picture for user ${userId} : ${imageUrl}`)
	return imageUrl;


}

async function uploadImageToDirectus(imageUrl: string, directusAccessToken: string, directusUserId: string) {

	let base64String = await fromUrlToBase64(imageUrl);

	const DIRECTUS_PROJECT_URL = 'https://directus.coders.mu';

	try {
		// Make a POST request to /files in the Directus instance

		const uploadResponse = await axios.patch(
			`${DIRECTUS_PROJECT_URL}/users/${directusUserId}`,
			{
				profile_picture: base64String
			},
			{
				headers: {
					Authorization: `Bearer ${directusAccessToken}`,
				},
			});

		console.log('File uploaded successfully:', uploadResponse.data);
	} catch (error: any) {
		console.error('Error uploading file to Directus:', error.message);
	}
}

async function fromUrlToBase64(imageUrl: string) {

	let result = await fetch(imageUrl)
		.then(response => response.arrayBuffer())
		.then(buffer => {
			const base64String = btoa(String.fromCharCode(...new Uint8Array(buffer)));
			return base64String
		})
		.catch(error => console.error('Error fetching or converting image:', error));

	return result
}

export default async (req: VercelRequest, res: VercelResponse): Promise<void> => {
	try {
		const userId = req.headers['user-id'] as string;
		const accessToken = req.headers['access-token'] as string;

		let imageUrl = await fetchPicture(accessToken)

		// Example usage
		await uploadImageToDirectus(imageUrl, accessToken, userId);

		console.log(imageUrl);
		res.status(200).json({
			imageUrl: imageUrl,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Internal Server Error' });
	}
};
