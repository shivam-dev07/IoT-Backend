# Device Logs and Real-Time Data Fix

## Issues Identified

### 1. ❌ Device Logs Not Showing in System Logs
- **Problem**: Direct device sensor data (Device0001, Device0002) from `SensorData` MQTT topic was being stored but NO logs were being created
- **Cause**: `handleSensorData()` in `mqtt.service.js` was missing log insertion

### 2. ❌ Direct Devices Not Showing in RealTimeData Filters
- **Problem**: Only gateway nodes appeared in filters, direct devices were invisible
- **Cause**: RealTimeData page only fetched and displayed gateway nodes, ignoring direct devices

### 3. ⚠️ Missing gateway_id for Direct Devices
- **Problem**: Direct devices don't go through gateways but gateway_id field was expected
- **Cause**: Schema requires gateway_id, but direct devices have NULL value (which is correct)

---

## Solutions Implemented

### Fix 1: Added Log Creation for Device Sensor Data ✅

**File**: `src/services/mqtt.service.js`

**Changed** (lines 194-206):
```javascript
// BEFORE: No log creation
await dbService.insertSensorData({
  source_type: 'device',
  source_id: device_id,
  data_type: type,
  value: value,
  raw_data: payload,
});

// AFTER: With log creation and gateway_id
await dbService.insertSensorData({
  source_type: 'device',
  source_id: device_id,
  gateway_id: null, // Direct device, not via gateway
  data_type: type,
  value: value,
  raw_data: payload,
});

// Create log entry for device sensor data
await dbService.insertLog({
  level: 'info',
  category: 'device',
  source_id: device_id,
  message: `${type}: ${value}`,
  details: JSON.stringify(payload),
});
```

**Impact**: 
- ✅ Device logs now appear in System Logs
- ✅ Each sensor reading creates a log entry
- ✅ Logs categorized by 'device' category
- ✅ Message shows data type and value (e.g., "Temperature: 22")

---

### Fix 2: Added Direct Device Support to RealTimeData ✅

**File**: `admin-dashboard/src/pages/RealTimeData.jsx`

**Changes**:

1. **Added Device State and API Import**:
```javascript
import { sensorDataAPI, gatewaysAPI, devicesAPI } from '../services/api';

const [devices, setDevices] = useState([]);
const [sourceType, setSourceType] = useState('all'); // 'all', 'device', 'gateway'
const [selectedDevice, setSelectedDevice] = useState('all');
```

2. **Added Device Fetching**:
```javascript
const fetchDevices = async () => {
  try {
    const response = await devicesAPI.getAll();
    setDevices(response.data.data || []);
  } catch (error) {
    console.error('Error fetching devices:', error);
  }
};

// Called in useEffect
fetchDevices();
```

3. **Added Source Type Filter**:
```jsx
{/* Source Type Filter */}
<div>
  <label>Source Type</label>
  <select value={sourceType} onChange={(e) => setSourceType(e.target.value)}>
    <option value="all">All Sources</option>
    <option value="device">Direct Devices</option>
    <option value="gateway">Gateway Nodes</option>
  </select>
</div>
```

4. **Added Direct Device Dropdown** (shows when sourceType is 'all' or 'device'):
```jsx
{(sourceType === 'all' || sourceType === 'device') && (
  <div>
    <label>Direct Device</label>
    <select value={selectedDevice} onChange={(e) => setSelectedDevice(e.target.value)}>
      <option value="all">All Devices</option>
      {devices.map((dev) => (
        <option key={dev.device_id} value={dev.device_id}>
          {dev.device_id}
        </option>
      ))}
    </select>
  </div>
)}
```

5. **Updated Filter Logic**:
```javascript
const filteredData = sensorData.filter((d) => {
  // Filter by source type
  const matchesSourceType = (() => {
    if (sourceType === 'all') return true;
    if (sourceType === 'device') return d.source_type === 'device' && !d.gateway_id;
    if (sourceType === 'gateway') return d.source_type === 'node' || d.gateway_id;
    return true;
  })();
  
  // Filter by direct device
  const matchesDevice = selectedDevice === 'all' || 
    (d.source_type === 'device' && d.source_id === selectedDevice);
  
  return matchesSourceType && matchesDevice && matchesGateway && matchesNode && matchesDate;
});
```

**Impact**:
- ✅ Direct devices (Device0001, Device0002) now appear in filters
- ✅ Can filter by source type: All / Direct Devices / Gateway Nodes
- ✅ Can select specific direct devices from dropdown
- ✅ Gateway and Node filters disabled when "Direct Devices" selected
- ✅ Device filter disabled when "Gateway Nodes" selected

---

## System Architecture Now Supports

### Two Data Paths:

```
Path 1: Direct Devices
┌─────────────┐    MQTT Topic: SensorData    ┌─────────────┐
│ Device0001  │ ──────────────────────────► │   Backend   │
│ Device0002  │    {device_id, type, value}  │  (MQTT)     │
└─────────────┘                               └──────┬──────┘
                                                     │
                                                     ▼
                                              ┌─────────────┐
                                              │  Database   │
                                              │  + Logs     │
                                              └──────┬──────┘
                                                     │
                                                     ▼
                                              ┌─────────────┐
                                              │  WebSocket  │
                                              │  Broadcast  │
                                              └──────┬──────┘
                                                     │
                                                     ▼
                                              ┌─────────────┐
                                              │  Frontend   │
                                              │  (Shows in  │
                                              │   filters)  │
                                              └─────────────┘

Path 2: Gateway Nodes
┌─────────────┐                              ┌─────────────┐
│TempHumBeac4 │    BLE Connection            │BLEGateway001│
│TempHumBeac1 │ ──────────────────────────► │             │
└─────────────┘                              └──────┬──────┘
                                                    │
                      MQTT Topic: BLEGatewayData    │
                      {gateway_id, beacon_name,     │
                       mac, temperature, humidity}  │
                                                    ▼
                                             ┌─────────────┐
                                             │   Backend   │
                                             │  (MQTT)     │
                                             └──────┬──────┘
                                                    │
                                                    ▼
                                             ┌─────────────┐
                                             │  Database   │
                                             │  + Logs     │
                                             └──────┬──────┘
                                                    │
                                                    ▼
                                             ┌─────────────┐
                                             │  WebSocket  │
                                             │  Broadcast  │
                                             └──────┬──────┘
                                                    │
                                                    ▼
                                             ┌─────────────┐
                                             │  Frontend   │
                                             │  (Shows in  │
                                             │   filters)  │
                                             └─────────────┘
```

---

## Database Schema

### sensor_data Table:
```sql
CREATE TABLE sensor_data (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source_type VARCHAR(20) NOT NULL,      -- 'device' or 'node'
  source_id VARCHAR(50) NOT NULL,         -- device_id or MAC address
  gateway_id VARCHAR(50),                 -- NULL for direct devices, gateway_id for nodes
  data_type VARCHAR(50),                  -- 'Temperature', 'Humidity', etc.
  value REAL,
  unit VARCHAR(20),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  raw_data TEXT
);
```

### logs Table:
```sql
CREATE TABLE logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  level VARCHAR(20),         -- 'info', 'warn', 'error'
  category VARCHAR(50),      -- 'device', 'gateway', 'node', 'system'
  source_id VARCHAR(50),     -- device_id or gateway_id
  message TEXT,
  details TEXT
);
```

---

## Expected Behavior After Fix

### System Logs Page:
```
[2025-11-02 14:59:41] [info] [device] Device0001 - Temperature: 22
[2025-11-02 14:59:41] [info] [device] Device0001 - Humidity: 44
[2025-11-02 14:59:39] [info] [gateway] BLEGateway0001 -> TempHumBeacon4 (58:8c:81:ab:a6:16)
[2025-11-02 14:59:39] [info] [gateway] BLEGateway0001 -> TempHumBeacon1 (58:8c:81:ae:93:8a)
```

### RealTimeData Filters:
```
┌─────────────────────────────────────────────────────────────────┐
│ Source Type: [All Sources ▼]                                    │
│ Direct Device: [All Devices ▼] [Device0001] [Device0002]       │
│ Gateway: [All Gateways ▼] [BLEGateway0001]                     │
│ Gateway Node: [All Nodes ▼] [TempHumBeacon4] [TempHumBeacon1]  │
└─────────────────────────────────────────────────────────────────┘
```

### Filter Behavior:
- **Source Type = "All Sources"**: Shows all devices and nodes
- **Source Type = "Direct Devices"**: Shows only Device0001, Device0002 (Gateway/Node filters disabled)
- **Source Type = "Gateway Nodes"**: Shows only TempHumBeacon4, TempHumBeacon1 (Device filter disabled)

---

## Testing Instructions

### 1. Verify Device Logs:
1. Open **System Logs** page
2. You should see entries like: `[device] Device0001 - Temperature: 22`
3. Logs should appear every 10 seconds as MQTT messages arrive

### 2. Verify RealTimeData Filters:
1. Open **Real-Time Data** page
2. Check **Source Type** dropdown shows: All Sources, Direct Devices, Gateway Nodes
3. Select **"Direct Devices"**:
   - Should see Device0001, Device0002 in dropdown
   - Gateway and Node filters should be disabled
   - JSON feed should show only direct device data
4. Select **"Gateway Nodes"**:
   - Should see BLEGateway0001 in Gateway dropdown
   - Select gateway to see TempHumBeacon4, TempHumBeacon1
   - JSON feed should show only gateway node data

### 3. Verify JSON Feed:
**Direct Device Entry**:
```json
{
  "source_type": "device",
  "source_id": "Device0001",
  "gateway_id": null,
  "data_type": "Temperature",
  "value": 22,
  "timestamp": "11/2/2025, 2:59:41 PM"
}
```

**Gateway Node Entry**:
```json
{
  "source_type": "node",
  "source_id": "58:8c:81:ab:a6:16",
  "gateway_id": "BLEGateway0001",
  "data_type": "Temperature",
  "value": 28.5,
  "timestamp": "11/2/2025, 2:59:39 PM"
}
```

---

## Summary

✅ **Fixed**: Device logs now created for direct sensor data
✅ **Fixed**: Direct devices appear in RealTimeData filters
✅ **Enhanced**: Source Type filter to switch between Direct Devices and Gateway Nodes
✅ **Maintained**: Backward compatibility with existing gateway node functionality

**Result**: System now fully supports both direct device communication and gateway-based node networks! 🎉
