# Google OAuth Setup Guide

Complete guide to enable Google Sign-In login in your Velist application.

---

## Overview

Velist supports authentication using Google OAuth 2.0. With this feature, users can log in or register using their Google account without needing to create a password.

## Prerequisites

- Google Account (Gmail/Google Workspace)
- Access to [Google Cloud Console](https://console.cloud.google.com/)

---

## Step-by-Step Setup

### 1. Create Project in Google Cloud Console

1. Open [Google Cloud Console](https://console.cloud.google.com/)
2. Click the project dropdown in the top navigation bar → **New Project**
3. Enter:
   - **Project name**: `Velist App` (or your app name)
   - **Location**: Optional (can be left empty)
4. Click **Create**
5. Wait a moment for the project to be created, then select it from the dropdown

---

### 2. Enable Google+ API

1. In the left sidebar, click **APIs & Services** → **Library**
2. Search for **Google+ API** (or "Google People API")
3. Click the search result, then click **Enable**
4. Wait until the API is enabled (usually about 1-2 minutes)

> **Note**: Google+ API is deprecated, use **Google People API** to get profile info.

---

### 3. Configure OAuth Consent Screen

1. In the left sidebar, click **APIs & Services** → **OAuth consent screen**
2. Select **External** (for apps accessible by anyone) or **Internal** (only for Google Workspace organization)
3. Click **Create**
4. Fill in the following information:

#### App Information
| Field | Value |
|-------|-------|
| **App name** | Velist App (or your app name) |
| **User support email** | Your support email |
| **App logo** | Optional - you can upload your app logo |

#### App Domain
| Field | Value |
|-------|-------|
| **Application home page** | `http://localhost:3000` (dev) or production domain |
| **Application privacy policy link** | URL to privacy policy |
| **Application terms of service link** | URL to terms of service |

#### Authorized Domains
Add your domains:
- `localhost` (for development)
- `yourdomain.com` (for production)

5. Click **Save and Continue**
6. On the **Scopes** page, click **Add or Remove Scopes**
7. Search and select the following scopes:
   - `openid`
   - `email`
   - `profile`
8. Click **Update**, then **Save and Continue**
9. On the **Test Users** page, add your email for testing (for External apps that aren't verified yet)
10. Click **Save and Continue** → **Back to Dashboard**

---

### 4. Create OAuth 2.0 Credentials

1. In the left sidebar, click **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Select **Application type**: `Web application`
4. Fill in the information:

| Field | Value |
|-------|-------|
| **Name** | Velist Web Client |
| **Authorized JavaScript origins** | `http://localhost:3000` |
| **Authorized redirect URIs** | `http://localhost:3000/auth/google/callback` |

5. For production, also add:
   - **Authorized JavaScript origins**: `https://yourdomain.com`
   - **Authorized redirect URIs**: `https://yourdomain.com/auth/google/callback`

6. Click **Create**
7. **Immediately copy** the Client ID and Client Secret that appear!
   - Click **Download JSON** to save credentials (optional but recommended)

> ⚠️ **IMPORTANT**: Client Secret is only displayed once. If lost, you must create new credentials.

---

### 5. Configure in Velist Application

1. Open the `.env` file in your project root
2. Add or update the following variables:

```env
# Google OAuth Credentials
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

# Optional: Custom redirect URI for production
# GOOGLE_REDIRECT_URI=https://yourdomain.com/auth/google/callback
```

3. Restart the application:

```bash
bun run dev
```

---

## Testing

1. Open the application in browser: `http://localhost:3000`
2. Click the **Login** or **Register** menu
3. Click the **"Sign in with Google"** button
4. Select your Google account
5. If successful, you'll be redirected to the dashboard

---

## Troubleshooting

### Error: "redirect_uri_mismatch"

**Cause**: Redirect URI in Google Console doesn't match what the app is sending.

**Solution**:
- Make sure `http://localhost:3000/auth/google/callback` is added to Authorized redirect URIs
- Check for trailing slash or typos
- For production, make sure the protocol is `https://`

### Error: "unauthorized_client"

**Cause**: OAuth consent screen is not configured or the app is still in "Testing" status.

**Solution**:
- Make sure you've filled out the OAuth consent screen (Step 3)
- Add your email as a Test User if the app status is "Testing"

### Error: "access_denied"

**Cause**: User denied permission or scope doesn't match.

**Solution**:
- Make sure scopes `openid`, `email`, `profile` are added
- Try clearing cookies and try again

### Error: "invalid_client" on callback

**Cause**: Client Secret is wrong or environment variable hasn't been loaded.

**Solution**:
- Check that `.env` file is correct
- Make sure there are no spaces at the beginning/end of Client ID and Secret
- Restart server after changing `.env`

---

## Production Checklist

Before deploying to production, make sure:

- [ ] OAuth consent screen is **Published** (not Testing)
- [ ] App is **verified** by Google (for sensitive scopes)
- [ ] Production redirect URI is added
- [ ] `GOOGLE_REDIRECT_URI` in `.env` production is correct
- [ ] Privacy Policy and Terms of Service are available online
- [ ] App name and logo are final (cannot be easily changed after verified)

### Publishing OAuth Consent Screen

1. In Google Cloud Console, open **APIs & Services** → **OAuth consent screen**
2. Click **PUBLISH APP**
3. Confirm by clicking **Confirm**
4. Wait for review from Google (can take several days for sensitive scopes)

---

## Security Best Practices

1. **Don't commit `.env` file** to repository
2. **Rotate Client Secret** periodically (3-6 months)
3. **Use HTTPS** for production
4. **Validate state parameter** to prevent CSRF attack (handled by Velist)
5. **Limit scope** - only request permissions that are actually needed

---

## References

- [Google Identity Platform - OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Arctic Documentation](https://arcticjs.dev/) - OAuth library used by Velist
