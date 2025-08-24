# Local Testing Guide - Resolving CORS Issues

## 🚨 **The Problem: CORS with file:// Protocol**

When opening `dist/index.html` directly in a browser, you'll encounter:

```
Access to CSS stylesheet at 'file:///C:/assets/index-DuAkzFHt.css' from origin 'null' has been blocked by CORS policy
Access to script at 'file:///C:/assets/index-DM53kHQK.js' from origin 'null' has been blocked by CORS policy
```

**Why this happens:**
- Modern browsers block local file access for security
- `file://` URLs have `origin: null` which violates Same-Origin Policy
- ES6 modules and external assets require HTTP/HTTPS protocols

## ✅ **Solution 1: Python HTTP Server (Recommended)**

### **Quick Start:**
```bash
# Navigate to the dist folder
cd dist

# Start Python server
python -m http.server 8080

# Open browser
# http://localhost:8080
```

### **Advantages:**
- ✅ Built into Python (no installation needed)
- ✅ Proper HTTP protocol
- ✅ Handles MIME types correctly
- ✅ Works with SPA routing

## ✅ **Solution 2: Node.js HTTP Server**

### **Using http-server package:**
```bash
# Install globally
npm install -g http-server

# Serve the dist folder
npx http-server dist -p 8080 -c-1 --cors

# Open browser
# http://localhost:8080
```

### **Using custom server:**
```bash
# Use the included serve.js
npm run serve

# Open browser
# http://localhost:8080
```

## ✅ **Solution 3: Vite Preview Server**

### **Official Vite method:**
```bash
# Build the application
npm run build

# Start preview server
npm run preview

# Open browser (usually http://localhost:4173)
```

### **Custom preview with specific port:**
```bash
npx vite preview --port 8080 --host 0.0.0.0
```

## ✅ **Solution 4: Live Server (VS Code)**

### **If using VS Code:**
1. Install "Live Server" extension
2. Right-click on `dist/index.html`
3. Select "Open with Live Server"
4. Automatically opens in browser with proper HTTP protocol

## 🧪 **Testing Checklist**

Once you have the server running, test these features:

### **Core Functionality:**
- [ ] **Home page loads** with proper styling
- [ ] **Navigation works** between all pages
- [ ] **User registration** creates new accounts
- [ ] **Login/logout** functions properly
- [ ] **Check-in simulation** awards points
- [ ] **Points display** updates in real-time
- [ ] **Rewards catalog** shows available items
- [ ] **Reward redemption** deducts points correctly
- [ ] **Profile editing** saves changes
- [ ] **Data persistence** across browser sessions

### **Technical Verification:**
- [ ] **No CORS errors** in browser console
- [ ] **CSS styling** applied correctly
- [ ] **JavaScript functionality** working
- [ ] **Responsive design** on mobile viewport
- [ ] **Client-side routing** (refresh any page)
- [ ] **LocalStorage fallback** functioning

## 🔧 **Troubleshooting**

### **Port Already in Use:**
```bash
# Try different ports
python -m http.server 8081
# or
npx http-server dist -p 8081
```

### **Permission Issues:**
```bash
# Run as administrator (Windows)
# or use different port above 1024
```

### **Browser Cache Issues:**
- Hard refresh: `Ctrl+F5` (Windows) or `Cmd+Shift+R` (Mac)
- Open Developer Tools → Network tab → "Disable cache"
- Clear browser cache and cookies

### **SPA Routing Issues:**
- Ensure server supports fallback to `index.html`
- Python server: Works automatically
- http-server: Use `--proxy http://localhost:8080?` flag

## 📱 **Mobile Testing**

### **Test on actual devices:**
1. Find your computer's IP address:
   ```bash
   # Windows
   ipconfig
   
   # Mac/Linux
   ifconfig
   ```

2. Start server with host binding:
   ```bash
   python -m http.server 8080 --bind 0.0.0.0
   ```

3. Access from mobile device:
   ```
   http://YOUR_IP_ADDRESS:8080
   ```

## 🚀 **Production Simulation**

### **Test with production-like environment:**
```bash
# Build with production settings
npm run build

# Serve with proper headers
npx http-server dist -p 8080 -c-1 --cors -g

# Test with network throttling in DevTools
```

## 🔒 **Security Notes**

### **Local development only:**
- These servers are for testing only
- Don't expose to public internet
- Use proper hosting for production

### **HTTPS Testing (Advanced):**
```bash
# Generate self-signed certificate
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes

# Serve with HTTPS
npx http-server dist -p 8443 -S -C cert.pem -K key.pem
```

## 📋 **Quick Commands Reference**

```bash
# Build and test in one command
npm run build && python -m http.server 8080 -d dist

# Alternative with Node.js
npm run build && npx http-server dist -p 8080 -c-1

# Using package.json scripts
npm run test:local

# Preview with Vite
npm run preview
```

## ✅ **Success Indicators**

You'll know it's working when:
- ✅ No CORS errors in browser console
- ✅ Application loads with full styling
- ✅ All interactive features function
- ✅ Data persists between page refreshes
- ✅ Mobile responsive design works
- ✅ Client-side routing functions properly

---

**Next Step**: Once local testing is complete, deploy to Netlify for production testing with real Netlify Blobs integration.
