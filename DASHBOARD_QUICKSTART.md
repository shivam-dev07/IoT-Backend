# 🔥 BlazeIoT Admin Dashboard - Quick Start Guide

## ✅ System Status

### Backend Server
- **URL**: http://localhost:3000
- **Status**: Running (API-only mode, MQTT disconnected)
- **Database**: SQLite (`./data/blazeiot.db`)
- **Default Credentials**: 
  - Username: `admin`
  - Password: `admin123`

### Frontend Dashboard  
- **URL**: http://localhost:5173
- **Status**: Running
- **Framework**: React + Vite + Tailwind CSS

---

## 🚀 Starting the Platform

### 1. Start Backend Server
```powershell
cd c:\Users\91902\Documents\IoT-Backend
node server.js
```

**Expected Output:**
```
✅ Database connected
✅ Admin user already exists  
⚠️  MQTT connection failed - server will continue without MQTT
✅ WebSocket server initialized
🚀 Server running on http://0.0.0.0:3000
✅ Platform ready! All systems operational.
```

### 2. Start Frontend Dashboard
```powershell
cd c:\Users\91902\Documents\IoT-Backend\admin-dashboard
npm run dev
```

**Expected Output:**
```
VITE v7.1.12  ready in 1192 ms
➜  Local:   http://localhost:5173/
```

### 3. Access Dashboard
Open browser: **http://localhost:5173**

---

## 🔐 Login Troubleshooting

### Issue: "Login Failed" Error

**Common Causes:**

#### 1. **Backend Server Not Running**
```powershell
# Check if server is running
netstat -ano | findstr :3000

# If not running, start it
cd c:\Users\91902\Documents\IoT-Backend
node server.js
```

#### 2. **Wrong API URL**
Check `admin-dashboard/.env`:
```
VITE_API_URL=http://localhost:3000/api
VITE_WS_URL=ws://localhost:3000
```

**After changing `.env`, restart Vite:**
```powershell
# Stop with Ctrl+C, then restart
npm run dev
```

#### 3. **Database Issue**
```powershell
# Recreate admin user
cd c:\Users\91902\Documents\IoT-Backend
node scripts/seedAdmin.js
```

#### 4. **CORS Issue**
Check browser console (F12) for errors like:
```
Access-Control-Allow-Origin
```

#### 5. **Port Conflict**
```powershell
# Check what's using port 3000
netstat -ano | findstr :3000

# Kill the process (replace PID)
taskkill /F /PID <PID>
```

---

## 🧪 Manual API Testing

### Test Login API Directly
```powershell
$body = @{
    username = "admin"
    password = "admin123"
} | ConvertTo-Json

Invoke-RestMethod -Uri http://localhost:3000/api/auth/login `
    -Method POST `
    -Body $body `
    -ContentType "application/json"
```

**Expected Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@blazeiot.com",
    "role": "admin"
  }
}
```

### Test Health Endpoint
```powershell
Invoke-RestMethod -Uri http://localhost:3000/api/health
```

---

## 🐛 Debug Steps

### 1. Check Backend Logs
Look for errors in the terminal running `node server.js`

### 2. Check Browser Console
1. Open dashboard: http://localhost:5173
2. Press `F12`
3. Go to **Console** tab
4. Try to login
5. Look for error messages (red text)

### 3. Check Network Tab
1. Press `F12` → **Network** tab
2. Try to login
3. Look for `login` request
4. Check:
   - **Status Code**: Should be `200`
   - **Response**: Should have `token` and `user`
   - **Request Payload**: Should have `username` and `password`

### 4. Verify Database
```powershell
# Check admin user exists
cd c:\Users\91902\Documents\IoT-Backend
node -e "const sqlite3 = require('sqlite3'); const db = new sqlite3.Database('./data/blazeiot.db'); db.get('SELECT * FROM users WHERE username = ?', ['admin'], (err, row) => { if (err) console.error(err); else console.log(row); db.close(); });"
```

---

## ✨ Features Available

### 1. Dashboard Overview
- Device count (online/offline)
- Gateway count  
- Connected nodes
- System status
- Recent sensor data feed

### 2. Devices Management
- View all devices
- Add new device
- Edit device details
- Delete device
- Real-time status updates

### 3. Gateways & Nodes
- View all gateways
- View nodes per gateway
- MAC address tracking
- RSSI signal strength

### 4. Real-Time Data
- Live sensor data charts
- Temperature/Humidity/Pressure graphs
- Filtered data view
- JSON data feed

### 5. OTA Management
- Upload firmware files
- View available firmware
- Trigger OTA updates
- Update history tracking

### 6. System Logs
- View all system logs
- Filter by level (error/warn/info/debug)
- Filter by category (mqtt/api/db/ota/ws)
- Auto-refresh toggle
- Search functionality

---

## 🔧 Configuration

### Backend Environment (`.env`)
```env
# Server
PORT=3000
NODE_ENV=development

# Database
DB_TYPE=sqlite
SQLITE_PATH=./data/blazeiot.db

# JWT
JWT_SECRET=blazeiot_super_secret_key_change_in_production_2024
JWT_EXPIRES_IN=24h

# Admin User
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
ADMIN_EMAIL=admin@blazeiot.com

# MQTT (Fix these for MQTT connectivity)
MQTT_URL=mqtts://ebe4b101faa541f9b868d0cc309edab3.s1.eu.hivemq.cloud:8883
MQTT_USERNAME=Shivam
MQTT_PASSWORD=Shivam
```

### Frontend Environment (`admin-dashboard/.env`)
```env
# Backend API URL
VITE_API_URL=http://localhost:3000/api

# WebSocket URL  
VITE_WS_URL=ws://localhost:3000
```

---

## 🎯 Testing Checklist

- [ ] Backend server starts without errors
- [ ] Frontend Vite server starts  
- [ ] Can access http://localhost:5173
- [ ] Login page loads correctly
- [ ] Can login with admin/admin123
- [ ] Dashboard shows stats
- [ ] WebSocket connection established
- [ ] Real-time updates working

---

## 📞 Common Error Messages

### "Login failed"
**Cause**: Backend not responding or wrong credentials  
**Fix**: Restart backend, verify it's on port 3000

### "Network Error"
**Cause**: Backend not running or CORS issue  
**Fix**: Start backend with `node server.js`

### "Cannot read property 'token'"
**Cause**: Backend returned unexpected response  
**Fix**: Check backend logs for errors

### "WebSocket connection failed"
**Cause**: Backend WebSocket not initialized  
**Fix**: Restart backend server

---

## 📊 Current Platform Status

✅ **Working:**
- REST API (all endpoints)
- JWT Authentication  
- Database (SQLite)
- WebSocket Server
- Admin Dashboard UI
- Device Management
- Gateway Management
- Real-time Data Visualization
- OTA Management
- System Logs

⚠️ **Needs Configuration:**
- MQTT Connection (credentials issue)
  - Platform works in API-only mode
  - Fix: Update MQTT_USERNAME and MQTT_PASSWORD in `.env`

---

## 🚨 Emergency Reset

If everything is broken:

```powershell
# 1. Stop all processes
Get-Process node | Stop-Process -Force

# 2. Delete database (will recreate with default admin)
Remove-Item c:\Users\91902\Documents\IoT-Backend\data\blazeiot.db

# 3. Restart backend
cd c:\Users\91902\Documents\IoT-Backend
node server.js

# 4. Restart frontend
cd admin-dashboard  
npm run dev
```

---

## 📝 Notes

- **MQTT is optional**: Platform works fully without MQTT (API-only mode)
- **Default admin**: Username `admin`, Password `admin123`
- **Change password**: Run `node scripts/seedAdmin.js`
- **Production**: Update JWT_SECRET, use PostgreSQL, enable HTTPS

---

**Created:** November 2, 2025  
**Platform:** BlazeIoT Solutions  
**Version:** 1.0.0
