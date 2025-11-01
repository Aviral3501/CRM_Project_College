# Step-by-Step Cookie/CORS Troubleshooting Guide

## 🎯 The Problem

When your **localhost frontend** tries to access your **deployed backend** (`https://crm-project-college-backend.onrender.com/api`), cookies aren't being sent, resulting in "Unauthorized - no token provided" errors, even though:
- ✅ Postman works (no CORS restrictions)
- ✅ Cookies are visible in browser DevTools
- ❌ But cookies aren't sent with requests

## 🔍 Root Causes Identified

### 1. **Missing `withCredentials` in Axios** ⚠️ CRITICAL
   - **Problem**: Axios instance didn't have `withCredentials: true`
   - **Why**: Browsers require this flag to send cookies cross-origin
   - **Fix**: Added to `frontend/src/api/axios.js`

### 2. **Cookie SameSite = "strict"** ⚠️ CRITICAL
   - **Problem**: `sameSite: "strict"` prevents cookies from being sent cross-origin
   - **Why**: "strict" only allows same-site requests (same domain)
   - **Fix**: Changed to `"none"` in production, `"lax"` for development in `backend/utils/generateTokenAndSetCookie.js`

### 3. **CORS Configuration** ⚠️ IMPORTANT
   - **Problem**: CORS wasn't flexible enough for different environments
   - **Why**: Needed dynamic origin checking
   - **Fix**: Updated `backend/index.js` with dynamic CORS origin checking

### 4. **BaseURL Configuration** ⚠️ IMPORTANT
   - **Problem**: Axios was hardcoded to `/api`, not using deployed backend
   - **Why**: Environment wasn't configured to use deployed backend
   - **Fix**: Made `axios.js` dynamic based on environment variables

---

## ✅ Step-by-Step Fixes Applied

### Fix 1: Update `frontend/src/api/axios.js`
**Changes:**
- Added `withCredentials: true` to axios instance
- Made `baseURL` dynamic based on environment variables
- Checks for `VITE_USE_DEPLOYED` or `VITE_BASE_URL`

### Fix 2: Update `backend/utils/generateTokenAndSetCookie.js`
**Changes:**
- Changed `sameSite: "strict"` → `sameSite: "none"` (production) or `"lax"` (development)
- **Note**: `sameSite: "none"` REQUIRES `secure: true` (HTTPS)

### Fix 3: Update `backend/index.js`
**Changes:**
- Dynamic CORS origin checking function
- Allows localhost in development
- Supports environment variable `FRONTEND_URL`

---

## 🛠️ Environment Variables Setup

### Backend `.env` File (in `backend/` directory):
```env
NODE_ENV=production
PORT=5000
JWT_SECRET=your_jwt_secret
FRONTEND_URL=https://your-frontend-url.com  # Optional: when you deploy frontend
```

### Frontend `.env` File (in `frontend/` directory):
```env
# Option 1: Use deployed backend
VITE_USE_DEPLOYED=true

# Option 2: Explicit backend URL
VITE_BASE_URL=https://crm-project-college-backend.onrender.com/api

# Option 3: Don't set either - will use localhost:5000 for development
```

**Recommended for your case:**
```env
VITE_USE_DEPLOYED=true
```

---

## 📋 Testing Checklist

### 1. **Check Browser DevTools Network Tab**
   - Open DevTools → Network tab
   - Make a request to your API
   - Click on the request → Headers tab
   - **Verify**: Request Headers should include `Cookie: token=...`
   - If missing, check console for CORS errors

### 2. **Check Browser DevTools Application/Storage Tab**
   - DevTools → Application → Cookies
   - **Verify**: You should see `token` cookie
   - Check cookie attributes:
     - ✅ `HttpOnly`: true
     - ✅ `Secure`: true (for HTTPS)
     - ✅ `SameSite`: None (for cross-origin)

### 3. **Check Console for Errors**
   - Look for CORS errors like:
     - `Access-Control-Allow-Origin`
     - `has been blocked by CORS policy`
   - Check for cookie warnings

### 4. **Check Backend Logs**
   - In Render dashboard or logs, check for:
     - CORS blocked origin messages
     - Token verification errors

---

## 🔧 Debugging Steps

### Step 1: Verify Environment Variables
```bash
# Frontend
cd frontend
# Check if .env file exists and has correct values
cat .env  # or type .env in Windows

# Backend
cd backend
cat .env  # or type .env in Windows
```

### Step 2: Test Cookie Reception
1. Login via your frontend
2. Check browser DevTools → Application → Cookies
3. Should see `token` cookie set

### Step 3: Test Cookie Sending
1. Make a request that requires authentication
2. Open DevTools → Network tab
3. Click on the request
4. Check **Request Headers** for `Cookie: token=...`

### Step 4: Check CORS Headers in Response
1. DevTools → Network → Click on request → Headers
2. Scroll to **Response Headers**
3. Verify:
   - `Access-Control-Allow-Origin`: Should show your frontend origin
   - `Access-Control-Allow-Credentials`: Should be `true`

---

## 🚨 Common Issues & Solutions

### Issue 1: Cookies Still Not Sending
**Check:**
- ✅ `withCredentials: true` in axios
- ✅ Cookie `sameSite: "none"` and `secure: true` for HTTPS
- ✅ CORS allows your origin
- ✅ Request is going to the correct backend URL

**Solution:**
- Clear browser cookies and login again
- Check network tab to see actual request URL

### Issue 2: CORS Errors
**Error:** `Access-Control-Allow-Origin` missing
**Solution:**
- Verify your frontend origin is in `allowedOrigins` array
- Check `NODE_ENV` environment variable
- Add your frontend URL to backend `.env` as `FRONTEND_URL`

### Issue 3: Cookie Not Set After Login
**Check:**
- Backend cookie settings (sameSite, secure)
- Response headers show `Set-Cookie`
- Browser DevTools → Application → Cookies

### Issue 4: "Secure cookie in non-secure context"
**Solution:**
- For localhost: Use `sameSite: "lax"` (already handled in code)
- For production HTTPS: Use `sameSite: "none"` with `secure: true` (already handled)

---

## 📝 Quick Reference: Cookie Attributes Explained

| Attribute | Value | Why |
|-----------|-------|-----|
| `httpOnly: true` | Prevents JavaScript access (security) | ✅ Correct |
| `secure: true` | Only sent over HTTPS | ✅ Required for `sameSite: "none"` |
| `sameSite: "none"` | Allows cross-origin | ✅ Needed for localhost → deployed backend |
| `sameSite: "lax"` | Allows some cross-origin | ✅ Good for same-origin or localhost |
| `sameSite: "strict"` | Only same-origin | ❌ Blocks cross-origin (was the problem!) |

---

## 🔄 Next Steps

1. **Set Environment Variables**
   - Create/update `frontend/.env` with `VITE_USE_DEPLOYED=true`
   - Restart your frontend dev server

2. **Clear Browser Data**
   - Clear cookies and cache
   - Or use Incognito/Private window for testing

3. **Test Login Flow**
   - Login via frontend
   - Check DevTools → Application → Cookies for `token`
   - Make an authenticated request
   - Check Network tab → Request Headers → Should see `Cookie: token=...`

4. **Monitor Backend Logs**
   - Check Render dashboard logs for CORS issues
   - Look for "CORS blocked origin" messages

---

## 💡 Pro Tips

1. **Use Browser DevTools**
   - Network tab shows if cookies are sent
   - Application tab shows stored cookies
   - Console shows CORS errors

2. **Test with curl/Postman**
   - Postman works because it doesn't enforce CORS
   - Use Postman to verify backend is working

3. **Check Environment Variables**
   - Vite requires `VITE_` prefix for environment variables
   - Restart dev server after changing `.env`

4. **Deploy Considerations**
   - When you deploy frontend, add its URL to backend `FRONTEND_URL`
   - Ensure backend `NODE_ENV=production` for correct cookie settings

---

## 🎯 Summary of Fixes

✅ **Fixed `frontend/src/api/axios.js`**
- Added `withCredentials: true`
- Made baseURL dynamic

✅ **Fixed `backend/utils/generateTokenAndSetCookie.js`**
- Changed `sameSite` to `"none"` (production) or `"lax"` (development)

✅ **Fixed `backend/index.js`**
- Made CORS more flexible with dynamic origin checking

✅ **Configuration**
- Set `VITE_USE_DEPLOYED=true` in frontend `.env`

After these fixes, your cookies should be sent correctly from localhost frontend to deployed backend! 🎉

