# 🚀 Quick Start: SQLite → MongoDB Migration

## ⚡ **5-Minute Setup**

### **1. MongoDB Atlas Setup (3 minutes)**
```
1. Go to: https://cloud.mongodb.com
2. Sign up (free)
3. Create M0 cluster (free tier)
4. Database Access → Add User → username: blazeiot_admin, password: YourPassword123
5. Network Access → Add IP → Allow Access from Anywhere (0.0.0.0/0)
6. Connect → Drivers → Copy connection string
```

**Your connection string:**
```
mongodb+srv://blazeiot_admin:YourPassword123@cluster0.xxxxx.mongodb.net/blazeiot?retryWrites=true&w=majority
```

---

### **2. Install & Configure (1 minute)**

```powershell
# Install MongoDB driver
npm install mongodb

# Update .env file
# Change these two lines:
DB_TYPE=mongodb
MONGODB_URI=mongodb+srv://blazeiot_admin:YourPassword123@cluster0.xxxxx.mongodb.net/blazeiot?retryWrites=true&w=majority
```

---

### **3. Migrate Data (1 minute)**

```powershell
# Backup current data
mkdir backups
Copy-Item data\blazeiot.db backups\blazeiot_backup.db

# Run migration
node scripts/migrate-to-mongodb.js
```

---

### **4. Start Server**

```powershell
npm start
```

**Look for:**
```
✅ MongoDB connected: blazeiot
🚀 Server running on http://0.0.0.0:3000
```

---

## ✅ **Verification**

```powershell
# Test API
curl http://localhost:3000/health

# Open dashboard
start http://localhost:5173
```

**Check Atlas:**
- Dashboard → Browse Collections
- Should see 8 collections with your data

---

## 🔄 **Rollback (if needed)**

```powershell
# In .env, change:
DB_TYPE=sqlite

# Restart
npm start
```

---

## 📚 **Files Created/Modified**

✅ `src/config/config.js` - Added MongoDB config  
✅ `src/services/database.mongodb.service.js` - MongoDB implementation (NEW)  
✅ `src/services/database.service.js` - Added MongoDB support  
✅ `scripts/migrate-to-mongodb.js` - Migration script (NEW)  
✅ `.env.mongodb.example` - MongoDB environment template (NEW)  
✅ `MONGODB_MIGRATION_GUIDE.md` - Complete guide (NEW)  

---

## 🆘 **Common Issues**

| Problem | Solution |
|---------|----------|
| "bad auth" | Check username/password in connection string |
| "connect ETIMEDOUT" | Whitelist IP in Atlas → Network Access |
| "MongoServerSelectionError" | Verify cluster is running in Atlas |
| Migration shows 0 records | Check `SQLITE_DB_PATH` in .env |

---

## 📊 **What You Get**

### **Free Tier (M0):**
- ✅ 512 MB storage
- ✅ Shared RAM
- ✅ Automated backups
- ✅ 100 max connections
- ✅ Perfect for development & small IoT projects

### **Performance:**
- ✅ Indexed queries (faster than SQLite for large datasets)
- ✅ Better concurrent write handling
- ✅ Automatic scaling (upgrade when needed)
- ✅ Cloud-based (access from anywhere)

---

**Need detailed instructions?** See `MONGODB_MIGRATION_GUIDE.md`
