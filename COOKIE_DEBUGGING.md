# Debugging: Why Cookies Aren't Being Sent

## Step-by-Step Debugging

### Step 1: Check if Cookie is Set After Login

1. **Login via your frontend**
2. **Open DevTools (F12) → Application tab → Cookies**
3. **Look for `token` cookie**

**What to check:**
- ✅ Does the `token` cookie exist?
- ✅ What is the **Domain**? (Should be `.onrender.com` or `crm-project-college-backend.onrender.com`)
- ✅ What is the **Path**? (Should be `/`)
- ✅ What is **SameSite**? (Should be `None` for cross-origin)
- ✅ What is **Secure**? (Should be `✓` checked for HTTPS)
- ✅ What is **HttpOnly**? (Should be `✓` checked)

### Step 2: Check Network Request Headers

1. **Make an authenticated request** (e.g., `/api/analytics/dashboard`)
2. **DevTools → Network tab → Click on the request**
3. **Click on "Headers" tab**
4. **Look at "Request Headers"**

**What to check:**
- ❌ Do you see `Cookie: token=...` in Request Headers?
- ❌ If NO, cookies aren't being sent

### Step 3: Check Response Headers After Login

1. **After login, check Network tab**
2. **Click on the login request**
3. **Check "Response Headers"**
4. **Look for `Set-Cookie` header**

**What to check:**
- ✅ Do you see `Set-Cookie: token=...`?
- ✅ What are the cookie attributes in Set-Cookie?
  - Should have: `SameSite=None`
  - Should have: `Secure`
  - Should have: `Path=/`

## Common Issues & Solutions

### Issue 1: Cookie Not Set After Login

**Symptoms:**
- No `token` cookie in Application tab
- `Set-Cookie` header not in response

**Possible causes:**
- Backend cookie settings incorrect
- CORS not allowing credentials
- Cookie being rejected by browser

**Solution:**
- Check backend logs for cookie setting
- Verify `Set-Cookie` header in Network tab
- Check browser console for cookie errors

### Issue 2: Cookie Exists But Not Sent

**Symptoms:**
- `token` cookie exists in Application tab
- But NOT in Request Headers → No `Cookie:` header

**Possible causes:**
- `withCredentials: true` not set in axios
- Cookie `SameSite` blocking cross-origin
- Cookie `Secure` mismatch (HTTP vs HTTPS)
- Cookie domain mismatch

**Solution:**
1. **Check axios has `withCredentials: true`**
   ```javascript
   // Should be set globally
   axios.defaults.withCredentials = true;
   ```

2. **Check cookie SameSite**
   - Must be `None` for cross-origin
   - When `SameSite=None`, `Secure=true` is REQUIRED

3. **Clear and re-login**
   - Old cookies might have wrong settings
   - Clear all cookies
   - Login again to get new cookie

### Issue 3: Cookie Domain Mismatch

**Symptoms:**
- Cookie set for wrong domain
- Cookie not accessible from frontend

**Check:**
- Cookie Domain should be:
  - For `https://crm-project-college-backend.onrender.com`:
    - Domain: `.onrender.com` OR `crm-project-college-backend.onrender.com`
  - Should NOT be `localhost`

### Issue 4: Secure Cookie on Non-HTTPS

**Symptoms:**
- Cookie marked `Secure` but frontend is HTTP
- Browser rejects cookie

**Solution:**
- For localhost → deployed backend:
  - Backend cookie: `Secure=true` (OK, backend is HTTPS)
  - Frontend can be HTTP (localhost) but cookie will only be sent to HTTPS backend

## Quick Test

### Test 1: Check Cookie After Login
```javascript
// In browser console AFTER login
document.cookie; // Should show token (if not httpOnly) or empty (if httpOnly)
```

### Test 2: Check if Cookie is Sent
```javascript
// In browser console
fetch('https://crm-project-college-backend.onrender.com/api/test-cors', {
    method: 'GET',
    credentials: 'include'
})
.then(r => r.json())
.then(console.log);
// Check Network tab → Headers → Request Headers
// Should see: Cookie: token=...
```

### Test 3: Manually Check Cookie
1. DevTools → Application → Cookies
2. Click on your site (localhost:5173)
3. Look for `token` cookie
4. Check all attributes

## Expected Cookie Settings

For **localhost frontend** → **deployed backend**:

```
Name: token
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Domain: crm-project-college-backend.onrender.com (or .onrender.com)
Path: /
Expires: 7 days from now
HttpOnly: ✓
Secure: ✓ (because SameSite=None)
SameSite: None
```

## Action Items

1. ✅ **Clear ALL cookies** (Application → Storage → Clear site data)
2. ✅ **Log in again** (to get fresh cookie with correct settings)
3. ✅ **Check cookie in Application tab** (verify settings)
4. ✅ **Check Network tab → Request Headers** (should see `Cookie: token=...`)
5. ✅ **If still not working**, share:
   - Screenshot of cookie settings (Application tab)
   - Screenshot of Request Headers (Network tab)
   - Any errors in Console tab

