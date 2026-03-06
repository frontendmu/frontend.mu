# Google OAuth Setup Guide

## 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the **Google+ API** (APIs & Services > Library > search "Google+ API")

## 2. Configure OAuth Consent Screen

1. Go to **APIs & Services > OAuth consent screen**
2. Select **External** user type
3. Fill in required fields:
   - App name: `frontend.mu`
   - User support email: your email
   - Developer contact: your email
4. Add scopes: `email`, `profile`, `openid`
5. Add test users (while in testing mode)
6. **For production**: Submit for verification

## 3. Create OAuth Credentials

1. Go to **APIs & Services > Credentials**
2. Click **Create Credentials > OAuth client ID**
3. Select **Web application**
4. Configure:

| Field | Development | Production |
|-------|-------------|------------|
| Name | `frontend.mu-dev` | `frontend.mu-prod` |
| Authorized JavaScript origins | `http://localhost:3333` | `https://yourdomain.com` |
| Authorized redirect URIs | `http://localhost:3333/auth/google/callback` | `https://yourdomain.com/auth/google/callback` |

5. Copy the **Client ID** and **Client Secret**

## 4. Environment Variables

Add to your `.env` file:

```env
APP_URL=https://yourdomain.com
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
```

## 5. Production Checklist

- [ ] Use HTTPS (required by Google)
- [ ] Update `APP_URL` to production domain
- [ ] Create separate OAuth credentials for production
- [ ] Add production domain to authorized origins/redirects
- [ ] Publish OAuth consent screen (submit for verification if needed)
- [ ] Remove test user restrictions

## Troubleshooting

| Error | Solution |
|-------|----------|
| `redirect_uri_mismatch` | Ensure redirect URI in Google Console matches exactly |
| `invalid_request` with relative URI | Check `APP_URL` is set to full URL with protocol |
| `access_denied` | User not added as test user (if app unpublished) |
| `unauthorized_client` | Wrong client ID or client type |

## How It Works

1. User clicks "Continue with Google" on `/login`
2. Redirected to Google (`/auth/google`)
3. User authenticates with Google
4. Google redirects back to `/auth/google/callback`
5. App creates/links user account and logs them in
