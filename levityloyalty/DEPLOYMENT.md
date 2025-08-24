# Levity Loyalty - Deployment Guide

## 🚀 Quick Deployment Options

### Option 1: Netlify Drag & Drop (Fastest)

1. **Build the application** (already done):
   ```bash
   npm run build
   ```

2. **Deploy via Netlify Drop**:
   - Go to [netlify.com/drop](https://netlify.com/drop)
   - Drag the `levity-loyalty-deployment.zip` file (created in project root)
   - Get instant live URL

### Option 2: GitHub Integration (Recommended)

1. **Connect to Netlify**:
   - Go to [app.netlify.com](https://app.netlify.com)
   - Click "New site from Git"
   - Choose GitHub → `Mythicool/levityloyalty`

2. **Build Settings**:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Node version**: `18`

3. **Environment Variables**:
   ```
   VITE_APP_NAME=Levity Loyalty
   VITE_RESTAURANT_NAME=Levity Breakfast House
   VITE_POINTS_PER_VISIT=10
   VITE_ENVIRONMENT=production
   ```

## 🔧 Post-Deployment Setup

### 1. Configure Custom Domain (Optional)
- In Site Settings → Domain management
- Add custom domain: `loyalty.levitybreakfast.com`

### 2. Enable HTTPS
- Automatically enabled by Netlify
- Force HTTPS redirect in Site Settings

### 3. Set up Netlify Blobs
1. **Get Site ID**:
   - Found in Site Settings → General → Site details

2. **Generate Access Token**:
   - User Settings → Applications → Personal access tokens
   - Create new token with "Sites" scope

3. **Update Environment Variables**:
   ```
   VITE_NETLIFY_SITE_ID=your_actual_site_id
   VITE_NETLIFY_TOKEN=your_actual_token
   ```

## 📱 Testing Checklist

After deployment, verify:

- ✅ **Home page** loads correctly
- ✅ **User registration** works
- ✅ **Login/logout** functions
- ✅ **Check-in simulation** awards points
- ✅ **Rewards redemption** deducts points
- ✅ **Data persistence** across sessions
- ✅ **Mobile responsiveness**
- ✅ **All routes** work (no 404s)

## 🔄 Continuous Deployment

Once connected to GitHub:
- **Automatic builds** on every push to `main`
- **Preview deployments** for pull requests
- **Build notifications** via email/Slack

## 🛠️ Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📊 Performance Metrics

Current build output:
- **HTML**: 0.46 kB (gzipped: 0.30 kB)
- **CSS**: 4.18 kB (gzipped: 1.35 kB)
- **JavaScript**: 271.16 kB (gzipped: 80.90 kB)
- **Total**: ~276 kB (excellent for mobile)

## 🔐 Security Features

- **HTTPS** enforced
- **XSS protection** headers
- **Content Security Policy** ready
- **Secure authentication** flow
- **Data validation** on all inputs

## 📞 Support

For deployment issues:
- Check build logs in Netlify dashboard
- Verify environment variables are set
- Ensure Node.js version compatibility
- Contact support if needed

---

**Ready for Production** ✅  
The application is fully functional with persistent data storage and production-ready optimizations.
