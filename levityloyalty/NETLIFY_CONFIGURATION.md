# Netlify Configuration - Levity Loyalty

## 🔑 **Your Netlify Credentials**

**Site ID:** `70de130c-10de-4f39-a3c5-e0db74160cc3`  
**Personal Access Token:** `nfp_ebPiY9aBLKWPS3LtPcaWAdt64uB3ntfib3e7`

## 🚀 **Step-by-Step Configuration**

### **1. Set Environment Variables in Netlify Dashboard**

Go to your Netlify site dashboard and navigate to:
**Site Settings → Environment Variables**

Add these **exact** environment variables:

```bash
VITE_NETLIFY_SITE_ID=70de130c-10de-4f39-a3c5-e0db74160cc3
VITE_NETLIFY_TOKEN=nfp_ebPiY9aBLKWPS3LtPcaWAdt64uB3ntfib3e7
VITE_APP_NAME=Levity Loyalty
VITE_RESTAURANT_NAME=Levity Breakfast House
VITE_POINTS_PER_VISIT=10
VITE_ENVIRONMENT=production
```

### **2. Deploy/Redeploy Your Site**

Since the code is already pushed to GitHub:

**Option A: Automatic Deploy**
- Your site should auto-deploy when you push changes
- Check the "Deploys" tab in Netlify dashboard

**Option B: Manual Trigger**
- In Netlify dashboard → "Deploys" tab
- Click "Trigger deploy" → "Deploy site"

### **3. Verify Deployment**

After deployment completes (~2-3 minutes):

1. **Check Build Logs**
   - Go to "Deploys" tab
   - Click on the latest deploy
   - Verify no errors in build logs

2. **Test Your Live Site**
   - Open your Netlify URL: `https://[your-site-name].netlify.app`
   - The site should load correctly

### **4. Test Netlify Blobs Integration**

#### **Method 1: Debug Panel**
1. Open your live site
2. Look for database icon in bottom-right corner
3. Click it to open debug panel
4. Click "Test" button
5. **Expected Result**: Should show "netlify" environment with all ✅

#### **Method 2: Database Test Page**
1. Navigate to: `https://[your-site-name].netlify.app/database-test`
2. Click "Test Connection"
3. Click "Test User CRUD"
4. **Expected Result**: Should show "Storage Type: netlify"

#### **Method 3: Browser Console**
1. Open DevTools → Console
2. Look for debug messages:
   ```
   [Levity Loyalty Debug] Environment check: {isNetlify: true, ...}
   [Levity Loyalty Debug] Creating Netlify Blobs store: users
   ```

### **5. Test Data Persistence**

#### **Real-World Test:**
1. **Register a new account** on your live site
2. **Login and check-in** to earn points
3. **Close browser completely**
4. **Open in different browser/incognito mode**
5. **Login with same credentials**
6. **Verify**: Points should still be there (data persisted in cloud)

#### **Cross-Device Test:**
1. **Register account** on desktop
2. **Open site on mobile device**
3. **Login with same credentials**
4. **Verify**: Account and points are accessible

## ✅ **Success Indicators**

You'll know Netlify Blobs is working when:

- ✅ **Debug panel** shows "netlify" environment
- ✅ **All stores** show "netlify-blobs" type with ✅ status
- ✅ **Console logs** show "Creating Netlify Blobs store" messages
- ✅ **User accounts** persist across browser sessions
- ✅ **Points and redemptions** are permanently stored
- ✅ **No "localStorage fallback"** messages in console

## 🚨 **Troubleshooting**

### **If Debug Panel Shows "local" Environment:**

1. **Check Environment Variables**
   - Verify all variables are set in Netlify dashboard
   - Ensure exact spelling and no extra spaces
   - Variable names are case-sensitive

2. **Redeploy Site**
   - Environment variable changes require a new deployment
   - Wait 2-3 minutes for deployment to complete

3. **Clear Browser Cache**
   - Hard refresh: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)
   - Or open in incognito/private mode

### **If You See "Unauthorized" Errors:**

1. **Verify Token Permissions**
   - Token should have "Sites:read" and "Sites:write" permissions
   - If unsure, generate a new token

2. **Check Site ID**
   - Ensure Site ID matches exactly: `70de130c-10de-4f39-a3c5-e0db74160cc3`
   - No extra characters or spaces

### **If Build Fails:**

1. **Check Build Logs**
   - Look for specific error messages
   - Common issues: Node.js version, dependency problems

2. **Verify Package Installation**
   - Ensure `@netlify/blobs` is in package.json dependencies
   - Should be version `^10.0.8` or higher

## 📊 **Expected Performance**

With Netlify Blobs working:
- **Data operations**: Near-instant (cloud storage)
- **Cross-device sync**: Immediate
- **Reliability**: 99.9% uptime
- **Scalability**: Handles thousands of users

## 🔄 **Ongoing Maintenance**

### **Token Management:**
- **Current token expires**: Check token settings in Netlify
- **Renewal**: Generate new token before expiration
- **Security**: Keep token secure, don't share publicly

### **Monitoring:**
- **Check build logs** regularly for any issues
- **Monitor user feedback** for data persistence problems
- **Use debug tools** to verify integration health

## 🎯 **Next Steps**

1. **Set environment variables** in Netlify dashboard
2. **Trigger deployment** (or wait for auto-deploy)
3. **Test using debug tools** to verify Netlify Blobs
4. **Perform real-world testing** with user accounts
5. **Monitor for any issues** and use troubleshooting guide

---

**Your Site Configuration:**
- **Site ID**: `70de130c-10de-4f39-a3c5-e0db74160cc3`
- **Repository**: `https://github.com/Mythicool/levityloyalty.git`
- **Status**: ✅ Ready for Netlify Blobs integration

**Security Note**: Keep your Personal Access Token secure and don't share it publicly.
