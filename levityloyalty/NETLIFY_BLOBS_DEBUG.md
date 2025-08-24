# Netlify Blobs Integration Debugging Guide

## 🔍 **Diagnosing Netlify Blobs Issues**

### **Common Symptoms:**
- ✅ Application loads correctly
- ❌ Data doesn't persist across browser sessions
- ❌ User accounts reset after page refresh
- ❌ Points and redemptions are lost
- ❌ Console shows "using localStorage fallback"

## 🛠️ **Step 1: Verify Environment Variables**

### **Check Netlify Dashboard:**
1. Go to your site in Netlify dashboard
2. Navigate to **Site Settings → Environment Variables**
3. Verify these variables are set:

```bash
VITE_NETLIFY_SITE_ID=your_actual_site_id
VITE_NETLIFY_TOKEN=your_personal_access_token
VITE_APP_NAME=Levity Loyalty
VITE_RESTAURANT_NAME=Levity Breakfast House
VITE_POINTS_PER_VISIT=10
VITE_ENVIRONMENT=production
```

### **Get Your Site ID:**
1. In Netlify dashboard → **Site Settings → General**
2. Copy the **Site ID** (format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)
3. Paste exactly as `VITE_NETLIFY_SITE_ID`

### **Generate Personal Access Token:**
1. Go to **User Settings → Applications → Personal access tokens**
2. Click **"New access token"**
3. Set description: "Levity Loyalty App"
4. Select scopes: **"Sites:read"** and **"Sites:write"**
5. Copy token immediately and set as `VITE_NETLIFY_TOKEN`

## 🔧 **Step 2: Use Debug Panel**

### **Enable Debug Mode:**
1. Open your deployed app
2. Add `?debug=true` to the URL: `https://your-site.netlify.app?debug=true`
3. Click the database icon in bottom-right corner
4. Run **"Test Connection"**

### **Debug Panel Information:**
- **Environment**: Should show "netlify" for production
- **Site ID**: Should show ✅ if properly set
- **Token**: Should show ✅ if properly set
- **Stores**: Should show "netlify-blobs" type with ✅ status

## 🚨 **Step 3: Common Issues & Solutions**

### **Issue 1: Environment Variables Not Set**
**Symptoms:** Debug panel shows ❌ for Site ID or Token

**Solution:**
1. Double-check variable names (exact case-sensitive match)
2. Ensure no extra spaces or quotes
3. Redeploy site after setting variables
4. Wait 2-3 minutes for deployment to complete

### **Issue 2: Incorrect Site ID**
**Symptoms:** "Site not found" or "Access denied" errors

**Solution:**
1. Go to Netlify dashboard → Site Settings → General
2. Copy the exact Site ID (36 characters with dashes)
3. Update `VITE_NETLIFY_SITE_ID` environment variable
4. Redeploy

### **Issue 3: Invalid Access Token**
**Symptoms:** "Unauthorized" or "Token invalid" errors

**Solution:**
1. Generate new Personal Access Token
2. Ensure "Sites:read" and "Sites:write" permissions
3. Copy token immediately (it's only shown once)
4. Update `VITE_NETLIFY_TOKEN` environment variable
5. Redeploy

### **Issue 4: Package Not Installed**
**Symptoms:** "Module not found" errors

**Solution:**
```bash
npm install @netlify/blobs
npm run build
# Redeploy
```

## 🧪 **Step 4: Manual Testing**

### **Test in Browser Console:**
Open browser DevTools and run:

```javascript
// Check environment variables
console.log('Site ID:', import.meta.env.VITE_NETLIFY_SITE_ID)
console.log('Token:', import.meta.env.VITE_NETLIFY_TOKEN ? 'present' : 'missing')

// Test database connection
import('./src/services/dataService.js').then(({ databaseService }) => {
  databaseService.testConnection().then(console.log)
})
```

### **Expected Results:**
- Site ID should be a 36-character UUID
- Token should show "present"
- Connection test should show "netlify" environment
- All stores should show "success" status

## 📊 **Step 5: Verify Data Persistence**

### **Test User Registration:**
1. Register a new account
2. Note the user details
3. Close browser completely
4. Reopen and navigate to site
5. Try logging in with same credentials

**Expected:** Login should work (data persisted in Netlify Blobs)
**If Failed:** Data was stored in localStorage only

### **Test Points System:**
1. Login to account
2. Perform check-in (earn points)
3. Note points balance
4. Refresh page multiple times
5. Check points balance

**Expected:** Points should persist across refreshes
**If Failed:** Points reset to 0 (localStorage fallback)

## 🔄 **Step 6: Force Redeploy**

If environment variables are correct but still not working:

1. **Trigger New Deploy:**
   - Make a small change to README.md
   - Commit and push to trigger rebuild
   - Or use "Trigger deploy" in Netlify dashboard

2. **Clear Deploy Cache:**
   - In Netlify dashboard → Site Settings → Build & Deploy
   - Click "Clear cache and deploy site"

3. **Check Build Logs:**
   - Verify environment variables are loaded during build
   - Look for any Netlify Blobs related errors

## 🐛 **Step 7: Advanced Debugging**

### **Check Network Requests:**
1. Open DevTools → Network tab
2. Perform user registration
3. Look for requests to Netlify Blobs API
4. Check for 401, 403, or 404 errors

### **Console Logging:**
Look for these debug messages:
```
[Levity Loyalty Debug] Environment check: {...}
[Levity Loyalty Debug] Creating Netlify Blobs store: users
[Levity Loyalty Debug] Store users: Write test passed
```

### **Fallback Indicators:**
If you see these, Netlify Blobs is NOT working:
```
[Levity Loyalty Debug] Creating localStorage fallback for store: users
LocalStorage SET: users_user_123456
```

## ✅ **Step 8: Verification Checklist**

- [ ] **Environment variables** set correctly in Netlify dashboard
- [ ] **Site ID** is exact 36-character UUID from Site Settings
- [ ] **Access token** has proper permissions (Sites:read, Sites:write)
- [ ] **@netlify/blobs** package installed in package.json
- [ ] **Debug panel** shows "netlify" environment
- [ ] **Connection test** passes for all stores
- [ ] **User registration** persists across browser sessions
- [ ] **Points and redemptions** persist across page refreshes
- [ ] **No localStorage fallback** messages in console

## 🎯 **Expected Working State**

When properly configured:
1. **Debug panel** shows ✅ for all checks
2. **Console logs** show Netlify Blobs store creation
3. **User data** persists across devices and browsers
4. **Points and redemptions** are permanently stored
5. **No localStorage** fallback messages

## 📞 **Getting Help**

If issues persist:
1. **Check build logs** in Netlify dashboard
2. **Verify package.json** includes @netlify/blobs
3. **Test with fresh browser** (incognito mode)
4. **Contact Netlify support** with Site ID and error details

---

**Remember:** Changes to environment variables require a new deployment to take effect!
