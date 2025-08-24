# Netlify Database (Neon PostgreSQL) Setup Guide

## 🗄️ **Overview**

Your Levity Loyalty application now supports **dual storage systems**:
1. **Netlify Blobs** - Simple key-value storage (already working)
2. **Neon PostgreSQL** - Relational database with advanced features

The application automatically chooses the best available storage system.

## 🚀 **Setting Up Neon PostgreSQL Database**

### **Step 1: Create Neon Database**

1. **Go to Neon Console**
   - Visit: https://console.neon.tech
   - Sign up/login with your GitHub account

2. **Create New Project**
   - Click "Create Project"
   - Project name: "Levity Loyalty"
   - Region: Choose closest to your users
   - PostgreSQL version: Latest (15+)

3. **Get Connection String**
   - After creation, copy the connection string
   - Format: `postgresql://username:password@host/database`

### **Step 2: Configure Netlify Environment Variables**

Add these to your Netlify site environment variables:

```bash
# Database Configuration
VITE_DATABASE_URL=postgresql://username:password@host/database
DATABASE_URL=postgresql://username:password@host/database

# Storage Preference (optional)
VITE_STORAGE_PREFERENCE=auto
```

**Storage Preference Options:**
- `auto` - Use database if available, fallback to blobs
- `database` - Force database usage only
- `blobs` - Force Netlify Blobs usage only

### **Step 3: Initialize Database Schema**

The database schema includes these tables:
- **users** - User accounts with authentication
- **points_history** - Points earning/spending history
- **redemptions** - Reward redemption records
- **check_ins** - Daily check-in tracking

Schema is automatically applied when first user is created.

## 🧪 **Testing Your Setup**

### **Method 1: Database Test Page**
1. Navigate to: `https://levityloyalty.netlify.app/database-test`
2. Check "Environment Information" section
3. Run "Test Both Systems" to compare storage options
4. Run "Test Connection" to verify current storage
5. Run "Test User CRUD" to test operations

### **Method 2: Debug Panel**
1. Click database icon (bottom-right corner)
2. Run connection test
3. Check which storage system is being used

## 📊 **Storage System Comparison**

| Feature | Netlify Blobs | Neon PostgreSQL |
|---------|---------------|-----------------|
| **Setup Complexity** | ✅ Simple | ⚠️ Moderate |
| **Data Structure** | Key-Value | 🏆 Relational |
| **Query Capabilities** | ⚠️ Basic | 🏆 Advanced SQL |
| **Transactions** | ❌ No | 🏆 ACID |
| **Relationships** | ❌ Manual | 🏆 Foreign Keys |
| **Scalability** | ✅ Good | 🏆 Excellent |
| **Cost** | ✅ Included | 💰 Usage-based |
| **Backup/Recovery** | ⚠️ Manual | 🏆 Automatic |

## 🔄 **Hybrid Operation**

The application intelligently chooses storage:

### **Auto Mode (Recommended)**
```javascript
VITE_STORAGE_PREFERENCE=auto
```
- Uses PostgreSQL if available and configured
- Falls back to Netlify Blobs if database unavailable
- Provides best user experience

### **Database-Only Mode**
```javascript
VITE_STORAGE_PREFERENCE=database
```
- Forces PostgreSQL usage
- Fails if database not available
- Best for production with guaranteed database

### **Blobs-Only Mode**
```javascript
VITE_STORAGE_PREFERENCE=blobs
```
- Forces Netlify Blobs usage
- Ignores database even if available
- Good for simple deployments

## 🛠️ **Database Management**

### **Schema Updates**
```bash
# Generate migration files
npm run db:generate

# Apply migrations
npm run db:migrate

# Push schema directly (development)
npm run db:push
```

### **Database Studio**
```bash
# Open Drizzle Studio for database management
npm run db:studio
```

## 🔧 **Advanced Features with PostgreSQL**

### **Enhanced User Management**
- Password hashing with bcrypt
- User activity tracking
- Account status management

### **Advanced Analytics**
- Points earning patterns
- Redemption trends
- User engagement metrics

### **Data Integrity**
- Foreign key constraints
- Transaction safety
- Automatic timestamps

## 🚨 **Troubleshooting**

### **Database Connection Issues**
1. **Check connection string format**
   ```
   postgresql://username:password@host/database
   ```

2. **Verify Neon project is active**
   - Check Neon console for project status
   - Ensure database isn't suspended

3. **Test connection manually**
   ```bash
   # Use database test page
   https://levityloyalty.netlify.app/database-test
   ```

### **Environment Variable Issues**
1. **Check Netlify dashboard**
   - Verify `VITE_DATABASE_URL` is set
   - Ensure `DATABASE_URL` is also set

2. **Redeploy after changes**
   - Environment variable changes require new deployment

### **Fallback to Blobs**
If you see "Storage Type: blobs" when expecting database:
1. Check database connection string
2. Verify Neon project is active
3. Check for connection errors in console

## 📈 **Migration Strategy**

### **From Blobs to Database**
1. Set up Neon database
2. Configure environment variables
3. Set `VITE_STORAGE_PREFERENCE=auto`
4. New users automatically use database
5. Existing blob data remains accessible

### **Gradual Migration**
- New registrations use database
- Existing users continue with blobs
- Manual migration tools available

## 🎯 **Recommended Setup**

### **For Development**
```bash
VITE_STORAGE_PREFERENCE=auto
VITE_DATABASE_URL=your_neon_connection_string
```

### **For Production**
```bash
VITE_STORAGE_PREFERENCE=database
VITE_DATABASE_URL=your_neon_connection_string
DATABASE_URL=your_neon_connection_string
```

## ✅ **Success Indicators**

You'll know the database is working when:
- ✅ Database Test page shows "PostgreSQL Database ✅"
- ✅ Environment shows "Current Storage: database"
- ✅ User registration creates database records
- ✅ Points and redemptions persist across sessions
- ✅ Advanced features like transaction safety work

---

**Next Steps:**
1. Create Neon database project
2. Add connection string to Netlify environment variables
3. Test using the database test page
4. Monitor performance and user experience
