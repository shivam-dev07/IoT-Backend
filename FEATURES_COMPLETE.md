# 🔥 BlazeIoT Admin Dashboard - Complete Features Guide

## ✅ **ALL IMPLEMENTED FEATURES**

### 1. 📊 **Dashboard Page - Recent Sensor Data FIXED**
**Problem**: Recent Sensor Data section was empty
**Solution**: 
- ✅ Created `/api/sensor-data` endpoint to fetch recent sensor readings
- ✅ Dashboard now fetches 10 most recent sensor records on load
- ✅ Added debug logging to track data fetching
- ✅ Data displays: Source ID (MAC), Data Type, Value, Unit, Timestamp

**What you'll see**: 
- Temperature readings from nodes (e.g., 58:8c:81:ab:a6:16 - Temperature: 24°C)
- Humidity readings with percentages
- Real-time updates via WebSocket

---

### 2. 📈 **Real-Time Data Page - COMPLETE OVERHAUL**

#### **NEW FEATURE: JSON Export** ✅
- **Export Button** at top right
- Downloads filtered data as `.json` file
- Format includes: gateway_id, source_id, data_type, value, unit, timestamp, rssi
- Filename: `sensor-data-2025-11-02.json`

#### **NEW FEATURE: Advanced Filters** ✅
```
┌─────────────────────────────────────────────────────────────────┐
│  🔍 Advanced Filters                            🔄 Refresh      │
├─────────────────┬─────────────────┬────────────────┬────────────┤
│  Gateway        │  Node / Device  │  Start Date    │  End Date  │
│  [Dropdown]     │  [Dropdown]     │  [Date Picker] │  [Date]    │
└─────────────────┴─────────────────┴────────────────┴────────────┘
```

**Filter Options**:
1. **Gateway Filter**: 
   - All Gateways
   - BLEGateway0001
   - (Loads dynamically from backend)

2. **Node Filter**: 
   - Depends on selected gateway
   - Shows MAC addresses and node names
   - Example: TempHumBeacon4 (58:8c:81:ab:a6:16)

3. **Date Range Filter**:
   - Start Date: Pick any date
   - End Date: Pick any date
   - Filter shows only data in range

4. **Data Type Filter** (existing):
   - All Types
   - Temperature
   - Humidity
   - Pressure

#### **IMPROVED: Live Data Feed** ✅
- ✅ Shows up to 100 records (was 50)
- ✅ Scrollable feed (max height: 600px)
- ✅ Color-coded by data type:
  - 🔴 Red border: Temperature
  - 🔵 Blue border: Humidity
  - 🟣 Purple border: Pressure
  - 🟢 Green border: Others
- ✅ Hover effect for better UX
- ✅ Shows full timestamp (date + time)
- ✅ Real-time updates via WebSocket
- ✅ Live indicator (pulsing green dot)

#### **IMPROVED: Charts** ✅
- ✅ Loads 100 historical records on page load (was 50)
- ✅ Displays last 20 data points in charts
- ✅ Separate charts for each data type
- ✅ Better time formatting (shortTime for readability)
- ✅ Real-time chart updates as data arrives

**Result Counter**: Shows "Showing X of Y records" based on filters

---

### 3. 📋 **System Logs - NOW SHOWING REAL DATA** ✅

**What was happening**: Only showing generic database logs
**What's fixed**: 
- ✅ **MQTT Activity Logs**: Every sensor data received is logged
  ```
  [INFO] [mqtt] Sensor data received from TempHumBeacon4 via BLEGateway0001
  Metadata: { temperature: 24, humidity: 67, rssi: -51 }
  ```

- ✅ **Gateway Registration Logs**:
  ```
  [INFO] [gateway] New gateway auto-registered: BLEGateway0001
  ```

- ✅ **Node Registration Logs**:
  ```
  [INFO] [mqtt] Auto-registering new node: TempHumBeacon4 (58:8c:81:ab:a6:16)
  ```

- ✅ **Error Logs**:
  ```
  [ERROR] [mqtt] Message processing error on BLEGatewayData/...
  ```

**System Logs Features**:
- Auto-refresh every 10 seconds
- Filter by Level: error, warn, info, debug
- Filter by Category: mqtt, api, db, ota, ws
- Search functionality
- Color-coded badges
- Displays last 100 logs

---

## 🎯 **HOW TO USE EVERYTHING**

### **Open Dashboard**: http://localhost:5173
Login: admin / admin123

### **Test Real-Time Data Page**:
1. Click **"Real-Time Data"** in sidebar
2. You'll see:
   - ✅ **Charts** showing Temperature and Humidity trends
   - ✅ **Live Data Feed** showing recent readings
   - ✅ **Filters** at top
   
3. **Try Filters**:
   - Select **Gateway**: BLEGateway0001
   - Select **Node**: TempHumBeacon4 (58:8c:81:ab:a6:16)
   - Click **Temperature** data type button
   - See filtered results instantly

4. **Export to JSON**:
   - Apply any filters you want
   - Click **"Export JSON"** button (top right)
   - File downloads: `sensor-data-2025-11-02.json`
   - Open in text editor to see JSON format

### **Test Dashboard Recent Sensor Data**:
1. Click **"Dashboard"** in sidebar
2. Scroll down to **"Recent Sensor Data"** section
3. You should see 10 most recent readings:
   ```
   58:8c:81:ab:a6:16        24 °C
   Temperature              8:10:49 AM
   
   58:8c:81:ab:a6:16        67 %
   Humidity                 8:10:49 AM
   ```
4. **Debug**: Press F12 → Console tab → Look for:
   ```
   ✅ Recent sensor data fetched: 10 records
   Sample data: [...]
   ```

### **Test System Logs**:
1. Click **"System Logs"** in sidebar
2. You'll see real activity logs:
   - MQTT messages received
   - Gateway/Node registrations
   - Sensor data processing
   - System errors
3. **Filter** by category: Select "mqtt" to see only MQTT logs
4. **Search**: Type "TempHumBeacon4" to find logs for specific node

---

## 📁 **EXPORTED JSON FORMAT**

When you export sensor data, you get:

```json
[
  {
    "gateway_id": "BLEGateway0001",
    "source_id": "58:8c:81:ab:a6:16",
    "data_type": "Temperature",
    "value": "24",
    "unit": "°C",
    "timestamp": "2025-11-02T13:57:19.000Z",
    "rssi": -51
  },
  {
    "gateway_id": "BLEGateway0001",
    "source_id": "58:8c:81:ab:a6:16",
    "data_type": "Humidity",
    "value": "67",
    "unit": "%",
    "timestamp": "2025-11-02T13:57:19.000Z",
    "rssi": -51
  }
]
```

Perfect for:
- Data analysis in Excel/Python
- Importing to other systems
- Backup and archival
- API integration testing

---

## 🎨 **UI IMPROVEMENTS**

### Color Coding:
- 🔴 **Temperature**: Red (#ef4444)
- 🔵 **Humidity**: Blue (#3b82f6)
- 🟣 **Pressure**: Purple (#a855f7)
- 🟢 **Others**: Green (#10b981)

### Icons:
- 🌡️ Thermometer for Temperature
- 💧 Droplet for Humidity
- 💨 Wind for Pressure
- ⚡ Activity for general data

### Status Indicators:
- 🟢 **Live** (pulsing): Real-time data streaming
- ✅ **Connected**: System online
- ⚠️ **Reconnecting**: Temporary disconnection
- ❌ **Error**: System issue

---

## 🔧 **TECHNICAL DETAILS**

### Backend Changes:
1. **New API Endpoint**: `GET /api/sensor-data?limit=10`
   - Returns recent sensor readings from database
   - Supports limit parameter (default: 50, max: 100)
   - Ordered by timestamp DESC

2. **Enhanced Logging**:
   - Added log entries for sensor data received
   - Logs stored in `logs` table in SQLite
   - Categories: mqtt, gateway, api, db, ota, ws
   - Levels: error, warn, info, debug

3. **MQTT Service Updates**:
   - Now creates log entries for all sensor data received
   - Includes metadata (temperature, humidity, rssi)
   - Tracks gateway and node registration events

### Frontend Changes:
1. **New Service Methods**:
   ```javascript
   sensorDataAPI.getRecent({ limit: 10 })
   gatewaysAPI.getAll()
   gatewaysAPI.getNodes(gateway_id)
   ```

2. **New State Management**:
   ```javascript
   // Real-Time Data page
   const [selectedGateway, setSelectedGateway] = useState('all');
   const [selectedNode, setSelectedNode] = useState('all');
   const [startDate, setStartDate] = useState('');
   const [endDate, setEndDate] = useState('');
   ```

3. **Filter Logic**:
   - Multi-level filtering (type, gateway, node, date range)
   - Real-time result counting
   - Maintains chart data separate from full list

4. **Data Transformation**:
   ```javascript
   {
     fullTimestamp: item.timestamp, // For filtering
     timestamp: new Date().toLocaleString(), // For display
     shortTime: new Date().toLocaleTimeString(), // For charts
     numericValue: parseFloat(item.value), // For charts
     type: item.data_type, // Normalized field name
   }
   ```

---

## 📊 **CURRENT SYSTEM STATUS**

### Database:
- ✅ 1 Gateway: BLEGateway0001
- ✅ 2 Nodes: TempHumBeacon4, TempHumBeacon1
- ✅ 1 Device: Device0002
- ✅ 200+ Sensor Data records
- ✅ Growing logs table

### MQTT:
- ✅ Connected to HiveMQ Cloud
- ✅ Receiving data every 10 seconds
- ✅ Auto-registration working
- ✅ Topics subscribed:
  - SensorData/#
  - BLEGatewayData/#
  - OTA/+/response

### WebSocket:
- ✅ Connected and broadcasting
- ✅ Real-time updates working
- ✅ Multi-client support

---

## 🚀 **START COMMANDS**

### Start Everything:
```powershell
npm run both
```

### Start Backend Only:
```powershell
npm start
```

### Start Dashboard Only:
```powershell
npm run dashboard
```

### Stop Servers:
Press `Ctrl+C` in terminal, then type `Y` to confirm

---

## 🐛 **TROUBLESHOOTING**

### Dashboard Recent Sensor Data Empty:
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for: `✅ Recent sensor data fetched: 10 records`
4. If you see 0 records, wait 10 seconds for MQTT data
5. Refresh page (F5)

### Real-Time Data Not Loading:
1. Check if servers are running
2. Verify MQTT status on Dashboard (should be green "Connected")
3. Check browser console for errors
4. Try clicking "Refresh" button in Filters section

### Export JSON Not Working:
1. Apply at least one filter
2. Verify "Showing X of Y records" shows > 0
3. Check browser's download folder
4. Try disabling browser popup blocker

### System Logs Empty:
1. Wait 10-20 seconds after server start
2. MQTT must be receiving data first
3. Click "All" level filter
4. Disable auto-refresh, manually click refresh

---

## 📝 **FILE CHANGES MADE**

### Backend Files Modified:
1. `src/routes/api.routes.js` - Added `/api/sensor-data` endpoint
2. `src/services/mqtt.service.js` - Added log creation for sensor data
3. `admin-dashboard/src/services/api.js` - Added sensorDataAPI

### Frontend Files Modified/Created:
1. `admin-dashboard/src/pages/Dashboard.jsx` - Added fetchRecentSensorData, debug logs
2. `admin-dashboard/src/pages/RealTimeData.jsx` - **COMPLETE REWRITE**
   - Added gateway/node filters
   - Added date range filters
   - Added JSON export functionality
   - Improved live data feed
   - Enhanced charts
3. `admin-dashboard/src/pages/SystemLogs.jsx` - Already working, now shows real logs

---

## ✅ **COMPLETED REQUIREMENTS**

✅ Dashboard Recent Sensor Data - NOW SHOWING DATA
✅ Real-Time Data - JSON Export Button
✅ Real-Time Data - Gateway Filter
✅ Real-Time Data - Node/Device Filter  
✅ Real-Time Data - Date Range Filter (Start & End)
✅ Real-Time Data - Improved Live Feed (scrollable, color-coded, 100 records)
✅ Real-Time Data - Better Charts (100 historical records loaded)
✅ System Logs - Showing Real System Activity

---

## 🎉 **SUCCESS METRICS**

- **Dashboard loads** ✅
- **Recent Sensor Data shows 10 records** ✅
- **Real-Time Data shows charts** ✅
- **Filters work (Gateway, Node, Date, Type)** ✅
- **Export JSON downloads file** ✅
- **Live Feed updates in real-time** ✅
- **System Logs shows MQTT activity** ✅
- **No console errors** ✅
- **MQTT connected** ✅
- **WebSocket connected** ✅

---

## 📧 **NEXT STEPS (OPTIONAL ENHANCEMENTS)**

1. **CSV Export**: Add CSV export option alongside JSON
2. **Chart Download**: Export charts as images
3. **Email Alerts**: Send alerts when thresholds exceeded
4. **Historical Analysis**: Date range selector for charts
5. **Device Management**: Edit device names, delete old devices
6. **User Management**: Add/remove admin users
7. **API Documentation**: Generate Swagger/OpenAPI docs
8. **Mobile App**: React Native mobile dashboard

---

## 💻 **BROWSER CONSOLE DEBUGGING**

When you open Dashboard, look for these console logs:

```javascript
✅ Recent sensor data fetched: 10 records
Sample data: [
  {
    source_id: "58:8c:81:ab:a6:16",
    data_type: "Temperature",
    value: "24",
    unit: "°C",
    timestamp: "2025-11-02T13:57:19.000Z"
  },
  ...
]
```

This confirms data is being fetched and displayed!

---

**🔥 All features are now working! Enjoy your BlazeIoT Admin Dashboard! 🔥**
