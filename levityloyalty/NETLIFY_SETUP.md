# Netlify Deployment & Configuration Guide

## 🚀 **Step-by-Step Deployment**

### **1. Deploy from GitHub (Recommended)**

1. **Go to Netlify Dashboard**
   - Visit: https://app.netlify.com (already open)
   - Sign in with your GitHub account

2. **Create New Site**
   - Click "Add new site" → "Import an existing project"
   - Choose "Deploy with GitHub"
   - Authorize Netlify to access your repositories

3. **Select Repository**
   - Find and select: `Mythicool/levityloyalty`
   - Click "Deploy site"

4. **Configure Build Settings**
   ```
   Branch to deploy: main
   Build command: npm run build
   Publish directory: dist
   ```

### **2. Environment Variables Setup**

In your Netlify site dashboard, go to **Site Settings → Environment Variables** and add:

#### **Required Variables:**
```bash
VITE_APP_NAME=Levity Loyalty
VITE_RESTAURANT_NAME=Levity Breakfast House
VITE_POINTS_PER_VISIT=10
VITE_ENVIRONMENT=production
```

#### **Netlify Blobs Variables (Add after deployment):**
```bash
VITE_NETLIFY_SITE_ID=your_actual_site_id
VITE_NETLIFY_TOKEN=your_personal_access_token
```

### **3. Get Your Site ID**

After deployment:
1. Go to **Site Settings → General → Site details**
2. Copy the **Site ID** (format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)
3. Add it as `VITE_NETLIFY_SITE_ID` environment variable

### **4. Generate Personal Access Token**

1. **Go to User Settings**
   - Click your profile → "User settings"
   - Navigate to "Applications" → "Personal access tokens"

2. **Create New Token**
   - Click "New access token"
   - Description: "Levity Loyalty App"
   - Expiration: "No expiration" (or set to 1 year)
   - Scopes: Select "Sites:read" and "Sites:write"

3. **Copy Token**
   - Copy the generated token immediately
   - Add it as `VITE_NETLIFY_TOKEN` environment variable

### **5. Configure Custom Domain (Optional)**

1. **Add Custom Domain**
   - Go to **Site Settings → Domain management**
   - Click "Add custom domain"
   - Enter: `loyalty.levitybreakfast.com`

2. **DNS Configuration**
   - Add CNAME record in your DNS provider:
   ```
   Type: CNAME
   Name: loyalty
   Value: your-site-name.netlify.app
   ```

3. **SSL Certificate**
   - Netlify automatically provisions SSL
   - Force HTTPS redirect in domain settings

## 🔧 **Build Configuration Verification**

Your `netlify.toml` is configured with:

- ✅ **Build command**: `npm run build`
- ✅ **Publish directory**: `dist`
- ✅ **Node.js version**: 18
- ✅ **SPA routing**: All routes redirect to `index.html`
- ✅ **Security headers**: XSS protection, frame options
- ✅ **Asset caching**: Optimized cache headers
- ✅ **Netlify Blobs**: Ready for integration

## 📱 **Post-Deployment Testing**

Once deployed, test these features:

### **Core Functionality:**
- [ ] **Home page** loads correctly
- [ ] **User registration** works
- [ ] **Login/logout** functions
- [ ] **Check-in simulation** awards points
- [ ] **Rewards redemption** deducts points
- [ ] **Data persistence** across sessions
- [ ] **Mobile responsiveness**
- [ ] **All routes** work (no 404 errors)

### **Technical Verification:**
- [ ] **Build logs** show successful deployment
- [ ] **Environment variables** are set correctly
- [ ] **HTTPS** is working
- [ ] **Custom domain** resolves (if configured)
- [ ] **Netlify Blobs** integration functioning

## 🔍 **Troubleshooting**

### **Build Failures:**
```bash
# Check build logs in Netlify dashboard
# Common issues:
- Node.js version mismatch
- Missing environment variables
- Dependency installation failures
```

### **Environment Variable Issues:**
```bash
# Verify variables are set correctly
# Check variable names match exactly
# Ensure no extra spaces or quotes
```

### **Routing Issues:**
```bash
# Verify netlify.toml redirects are working
# Check that all routes redirect to index.html
# Test direct URL access to app routes
```

### **Netlify Blobs Issues:**
```bash
# Verify Site ID is correct
# Check Personal Access Token permissions
# Ensure token hasn't expired
```

## 🎯 **Expected Results**

After successful deployment:

1. **Live URL**: `https://your-site-name.netlify.app`
2. **Custom Domain**: `https://loyalty.levitybreakfast.com` (if configured)
3. **Build Status**: ✅ Published
4. **HTTPS**: ✅ Enabled
5. **Environment**: ✅ Production ready

## 📊 **Performance Metrics**

Expected build output:
- **Build time**: ~2-3 minutes
- **Bundle size**: ~276 KB total
- **Lighthouse score**: 90+ (Performance, Accessibility, Best Practices, SEO)

## 🔄 **Continuous Deployment**

Once connected:
- ✅ **Auto-deploy** on every push to `main` branch
- ✅ **Preview deployments** for pull requests
- ✅ **Build notifications** via email
- ✅ **Rollback capability** to previous deployments

## 📞 **Support Resources**

- **Netlify Docs**: https://docs.netlify.com
- **Netlify Blobs**: https://docs.netlify.com/build/data-and-storage/netlify-blobs/
- **Build Troubleshooting**: https://docs.netlify.com/configure-builds/troubleshooting-tips/

---

**Next**: After deployment, update environment variables with your actual Site ID and Personal Access Token to enable Netlify Blobs integration.
