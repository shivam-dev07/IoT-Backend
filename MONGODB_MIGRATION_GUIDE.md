# 🔄 SQLite to MongoDB Atlas Migration Guide

Complete guide to migrate your BlazeIoT Platform from SQLite to MongoDB Atlas.

---

## 📋 **Prerequisites**

### 1. Create MongoDB Atlas Account
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up for a free account
3. Create a free M0 cluster (512 MB storage, sufficient for IoT data)
4. Choose your preferred cloud provider and region

### 2. Configure MongoDB Atlas

#### **Step 2.1: Create Database User**
1. In Atlas dashboard, go to **Database Access**
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Set username: `blazeiot_admin`
5. Set a strong password (save it securely)
6. Database User Privileges: **"Read and write to any database"**
7. Click **"Add User"**

#### **Step 2.2: Configure Network Access**
1. Go to **Network Access**
2. Click **"Add IP Address"**
3. For development: Click **"Allow Access from Anywhere"** (0.0.0.0/0)
4. For production: Add your server's specific IP address
5. Click **"Confirm"**

#### **Step 2.3: Get Connection String**
1. Go to **Database** → Click **"Connect"**
2. Choose **"Connect your application"**
3. Driver: **Node.js**, Version: **4.1 or later**
4. Copy the connection string:
   ```
   mongodb+srv://blazeiot_admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<password>` with your actual password
6. Add database name after `.net/`: `blazeiot`

**Final connection string example:**
```
mongodb+srv://blazeiot_admin:YourPassword123@cluster0.abcde.mongodb.net/blazeiot?retryWrites=true&w=majority
```

---

## 🚀 **Migration Steps**

### **Step 1: Install MongoDB Driver**

```powershell
npm install mongodb
```

### **Step 2: Update Environment Variables**

Edit your `.env` file:

```env
# Change database type from sqlite to mongodb
DB_TYPE=mongodb

# Add MongoDB connection string
MONGODB_URI=mongodb+srv://blazeiot_admin:YourPassword123@cluster0.abcde.mongodb.net/blazeiot?retryWrites=true&w=majority
```

**Important:** Replace with your actual MongoDB Atlas connection string!

### **Step 3: Backup Your Current SQLite Data**

```powershell
# Create backup directory
mkdir backups

# Copy SQLite database
Copy-Item data\blazeiot.db backups\blazeiot_backup_$(Get-Date -Format 'yyyyMMdd_HHmmss').db
```

### **Step 4: Run Migration Script**

This will transfer all existing data from SQLite to MongoDB:

```powershell
node scripts/migrate-to-mongodb.js
```

**Expected output:**
```
🔄 Starting SQLite to MongoDB migration...
✅ Connected to MongoDB: blazeiot

📊 Migrating users...
✅ Migrated 1 users
📊 Migrating devices...
✅ Migrated 15 devices
📊 Migrating gateways...
✅ Migrated 3 gateways
📊 Migrating nodes...
✅ Migrated 8 nodes
📊 Migrating sensor data...
  📦 Migrated 1000 sensor data records...
  📦 Migrated 2000 sensor data records...
✅ Migrated 2849 total sensor data records
📊 Migrating commands...
✅ Migrated 5 commands
📊 Migrating OTA updates...
✅ Migrated 2 OTA updates
📊 Migrating system logs...
✅ Migrated 150 total system logs

🎉 Migration completed successfully!
```

### **Step 5: Restart Server**

```powershell
# Stop current server (Ctrl+C)

# Start with MongoDB
npm start
```

**Verify startup logs:**
```
📊 Initializing database...
✅ MongoDB connected: blazeiot
✅ Database connected
🚀 Server running on http://0.0.0.0:3000
```

### **Step 6: Verify Migration**

Test your endpoints:

```powershell
# Test API
curl http://localhost:3000/health

# Test dashboard
# Open: http://localhost:5173
```

**Check MongoDB Atlas:**
1. Go to Atlas dashboard
2. Click **"Browse Collections"**
3. You should see collections:
   - `users`
   - `devices`
   - `gateways`
   - `nodes`
   - `sensor_data`
   - `commands`
   - `ota_updates`
   - `system_logs`

---

## 📊 **MongoDB vs SQLite - Key Differences**

| Feature | SQLite | MongoDB |
|---------|--------|---------|
| **Storage** | Local file | Cloud Atlas |
| **Scalability** | Limited | Horizontal scaling |
| **Concurrent writes** | Limited | High concurrency |
| **Data size** | < 1 GB recommended | Unlimited (with paid tiers) |
| **Query speed** | Fast for small data | Fast with indexing |
| **Backups** | Manual file copy | Automated snapshots |
| **Cost** | Free | Free tier (512 MB) |

---

## 🎯 **What Changed in Your Code**

### **1. Database Service (`database.service.js`)**
- Now automatically detects `mongodb` type
- Routes all calls to MongoDB service

### **2. New File: `database.mongodb.service.js`**
- Complete MongoDB implementation
- All methods compatible with existing code
- No changes needed in routes or MQTT service

### **3. Configuration (`config.js`)**
- Added `mongodb` section with connection options

### **4. Data Storage**
- SQLite: `data/blazeiot.db` (local file)
- MongoDB: Cloud Atlas (remote database)

---

## ⚙️ **MongoDB Atlas Features You Get**

### **1. Performance Insights**
- Real-time query performance monitoring
- Slow query analysis
- Index recommendations

### **2. Automated Backups**
- Point-in-time restore
- Snapshot retention
- Easy restore process

### **3. Monitoring**
- CPU/Memory usage
- Connection stats
- Query execution times

### **4. Alerts**
- Email/SMS notifications
- Custom alert conditions
- Integration with PagerDuty, Slack

### **5. Security**
- Encryption at rest
- Encryption in transit (TLS/SSL)
- Network isolation
- User authentication

---

## 🔧 **Advanced Configuration**

### **Production Settings**

For production, update MongoDB options in `config.js`:

```javascript
mongodb: {
  uri: process.env.MONGODB_URI,
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    maxPoolSize: 50,           // Increase for production
    minPoolSize: 10,           // Maintain minimum connections
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4,                 // Use IPv4
    retryWrites: true,
    w: 'majority',             // Write concern
  },
},
```

### **Connection String Options**

```
mongodb+srv://user:pass@cluster.mongodb.net/blazeiot?
  retryWrites=true        # Retry failed writes
  &w=majority             # Wait for majority acknowledgment
  &readPreference=primary # Read from primary node
  &maxPoolSize=50         # Max connection pool size
```

---

## 🐛 **Troubleshooting**

### **Error: "MongoServerError: bad auth"**
**Solution:** Check username/password in connection string

### **Error: "connect ETIMEDOUT"**
**Solution:** 
1. Check Network Access in Atlas (whitelist IP)
2. Verify firewall allows port 27017
3. Check internet connection

### **Error: "MongooseServerSelectionError"**
**Solution:**
1. Verify cluster is running (Atlas dashboard)
2. Check connection string format
3. Ensure database user has correct permissions

### **Migration script shows 0 records**
**Solution:**
1. Verify SQLite database path is correct
2. Check `SQLITE_DB_PATH` in `.env`
3. Ensure SQLite database exists

---

## 🔄 **Rollback to SQLite**

If you need to rollback:

```powershell
# 1. Stop server (Ctrl+C)

# 2. Change .env
# DB_TYPE=sqlite

# 3. Restore backup (if needed)
Copy-Item backups\blazeiot_backup_YYYYMMDD_HHMMSS.db data\blazeiot.db

# 4. Restart server
npm start
```

---

## 📞 **Support**

- **MongoDB Atlas Docs:** https://www.mongodb.com/docs/atlas/
- **MongoDB Node.js Driver:** https://www.mongodb.com/docs/drivers/node/
- **Community Forum:** https://www.mongodb.com/community/forums/

---

## ✅ **Post-Migration Checklist**

- [ ] MongoDB Atlas cluster created
- [ ] Database user created with password
- [ ] IP address whitelisted (0.0.0.0/0 for dev)
- [ ] Connection string added to `.env`
- [ ] `npm install mongodb` completed
- [ ] SQLite data backed up
- [ ] Migration script executed successfully
- [ ] Server restarted with `DB_TYPE=mongodb`
- [ ] All APIs tested and working
- [ ] Dashboard accessible and showing data
- [ ] Real-time MQTT data flowing to MongoDB
- [ ] WebSocket connections working
- [ ] Collections visible in Atlas dashboard

---

**🎉 Congratulations! Your BlazeIoT Platform is now running on MongoDB Atlas!**
