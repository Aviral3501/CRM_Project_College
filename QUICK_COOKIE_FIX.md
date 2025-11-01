# Quick Fix: Cookies Not Being Sent

## The Real Problem

**Postman works** because it doesn't have CORS restrictions and always sends cookies.

**Browser doesn't send cookies** because:
1. Cookie wasn't set correctly (wrong attributes)
2. Cookie exists but browser won't send it (SameSite/Secure mismatch)
3. Axios doesn't have `withCredentials: true`

## Immediate Steps

### Step 1: Clear ALL Cookies and Login Again
1. Open DevTools (F12)
2. Application tab → Storage → **Clear site data**
3. Or use **Incognito/Private window**
4. **Login again** - this sets a NEW cookie with correct settings

### Step 2: Check Cookie After Login

1. **After login, go to DevTools → Application → Cookies**
2. **Click on your domain** (localhost:5173)
3. **Look for `token` cookie**

**Check these attributes:**
- Name: `token`
- Value: Should be long JWT token
- Domain: Should match backend domain or be empty (same-origin)
- Path: `/`
- Expires: 7 days from now
- HttpOnly: ✓ (checked)
- Secure: ✓ (MUST be checked for SameSite=None)
- SameSite: **None** (MUST be None for cross-origin)

### Step 3: Check if Cookie is Sent

1. **Make a request** (e.g., go to analytics page)
2. **DevTools → Network tab → Click on request**
3. **Headers tab → Request Headers**
4. **Look for: `Cookie: token=...`**

**If you DON'T see `Cookie:` header:**
- Cookie isn't being sent
- Check cookie SameSite/Secure settings
- Verify `withCredentials: true` is set

## What I Just Fixed

✅ **Cookie settings** - Now properly sets `SameSite: None` + `Secure: true` for production
✅ **Added logging** - Backend will log cookie options when setting

## Next Steps

1. **Clear cookies** (Application → Clear site data)
2. **Login again** (gets fresh cookie with correct settings)
3. **Check cookie** (Application → Cookies → verify attributes)
4. **Check Request Headers** (Network tab → should see `Cookie: token=...`)

## If Still Not Working

Check these:

1. **Cookie Domain**: Should match backend domain OR be empty
   - Backend: `crm-project-college-backend.onrender.com`
   - Cookie domain: Empty or `.onrender.com`

2. **Cookie Path**: Must be `/`

3. **SameSite + Secure**: 
   - `SameSite=None` REQUIRES `Secure=true`
   - Both must be set for cross-origin

4. **withCredentials**: 
   - Must be `true` in axios
   - Already set globally: `axios.defaults.withCredentials = true`

## Test It Now

1. **Clear cookies** ← Most important!
2. **Login again**
3. **Check cookie exists** (Application tab)
4. **Make request** (analytics page)
5. **Check Request Headers** (Network tab)

The cookie should now be sent! 🎯

