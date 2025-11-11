# 🧪 BlazeIoT Platform - API Testing Guide

## Quick Start

### 1. Start the Server

```powershell
cd c:\Users\91902\Documents\IoT-Backend
node server.js
```

Expected output:
```
============================================================
🔥 BlazeIoT Solutions Platform - Starting...
============================================================
✅ Database connected
✅ Admin user created: admin
✅ MQTT broker connected (or running in API-only mode)
🚀 Server running on http://0.0.0.0:3000
============================================================
```

### 2. Login to Get JWT Token

```powershell
# Using PowerShell Invoke-RestMethod
$loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"username":"admin","password":"admin123"}'

# Save the token
$token = $loginResponse.token
Write-Host "Token: $token"
```

Or using curl:
```powershell
curl -X POST http://localhost:3000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{"username":"admin","password":"admin123"}'
```

### 3. Test API Endpoints

#### Get System Status
```powershell
$headers = @{ Authorization = "Bearer $token" }
Invoke-RestMethod -Uri "http://localhost:3000/api/status" -Headers $headers
```

#### Get All Devices
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/devices" -Headers $headers
```

#### Register a Device
```powershell
$deviceData = @{
  device_id = "TestDevice001"
  name = "Test Temperature Sensor"
  type = "Temperature"
  firmware_version = "1.0.0"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/devices" `
  -Method POST `
  -Headers $headers `
  -ContentType "application/json" `
  -Body $deviceData
```

#### Get All Gateways
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/gateways" -Headers $headers
```

#### Get System Logs
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/logs?limit=20" -Headers $headers
```

---

## 📡 Testing MQTT Integration

If MQTT connection is successful, devices will auto-register when they send data.

### Send Test MQTT Message (using Node.js)

Create a test file `test-mqtt-device.js`:

```javascript
const mqtt = require('mqtt');

const client = mqtt.connect('mqtts://ebe4b101faa541f9b868d0cc309edab3.s1.eu.hivemq.cloud:8883', {
  username: 'Shivam',
  password: 'Shivam',
  clientId: 'test-device-' + Math.random().toString(16).substr(2, 8)
});

client.on('connect', () => {
  console.log('Connected to MQTT broker');
  
  // Send direct device data
  const deviceData = {
    device_id: 'Device0005',
    type: 'Temperature',
    value: 25.5
  };
  
  client.publish('SensorData', JSON.stringify(deviceData), { qos: 1 }, () => {
    console.log('Published device data:', deviceData);
  });
  
  // Send gateway data
  const gatewayData = {
    gateway_id: 'TestGateway001',
    beacon_name: 'TempSensor01',
    mac: '11:22:33:44:55:66',
    temperature: 22.3,
    humidity: 65,
    rssi: -70
  };
  
  client.publish('BLEGatewayData', JSON.stringify(gatewayData), { qos: 1 }, () => {
    console.log('Published gateway data:', gatewayData);
    
    setTimeout(() => {
      client.end();
      console.log('Test completed');
    }, 1000);
  });
});

client.on('error', (error) => {
  console.error('MQTT Error:', error);
});
```

Run it:
```powershell
node test-mqtt-device.js
```

Then check if device was auto-registered:
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/devices" -Headers $headers
```

---

## 🌐 Testing WebSocket Connection

### JavaScript Example (Browser Console or Node.js)

```javascript
// Get your JWT token first from /api/auth/login

const ws = new WebSocket('ws://localhost:3000/ws?token=YOUR_JWT_TOKEN_HERE');

ws.onopen = () => {
  console.log('Connected to WebSocket');
  
  // Subscribe to device updates
  ws.send(JSON.stringify({
    type: 'subscribe',
    channel: 'devices'
  }));
  
  // Subscribe to sensor data
  ws.send(JSON.stringify({
    type: 'subscribe',
    channel: 'sensor_data'
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received:', data);
};

ws.onerror = (error) => {
  console.error('WebSocket error:', error);
};
```

---

## 📊 Sample API Responses

### Login Response
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

### Status Response
```json
{
  "success": true,
  "data": {
    "system": "BlazeIoT Solutions Platform",
    "version": "1.0.0",
    "status": "operational",
    "mqtt": {
      "connected": true,
      "broker": "mqtts://your-broker:8883",
      "clientId": "blazeiot-backend-server"
    },
    "stats": {
      "devices": 5,
      "gateways": 2
    },
    "timestamp": "2024-11-02T10:30:00.000Z"
  }
}
```

### Devices List Response
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "id": 1,
      "device_id": "Device0001",
      "name": "Temperature Sensor 1",
      "type": "Temperature",
      "status": "online",
      "firmware_version": "1.0.0",
      "last_seen": "2024-11-02T10:29:45.000Z",
      "created_at": "2024-11-02T09:15:00.000Z"
    }
  ]
}
```

---

## 🔧 Troubleshooting

### MQTT Connection Issues

If you see "MQTT connection failed - server will continue without MQTT":

1. **Check credentials** in `.env`:
   ```env
   MQTT_USERNAME=your_correct_username
   MQTT_PASSWORD=your_correct_password
   ```

2. **Verify HiveMQ Cloud cluster is active**

3. **Test with basic MQTT client** (like the old main.js)

4. The platform will continue running in API-only mode

### Database Issues

Reset database:
```powershell
Remove-Item ./data/blazeiot.db -Force
npm run init-db
```

### API Authentication Errors

Make sure to:
1. Login first to get JWT token
2. Include `Authorization: Bearer <token>` header in all requests
3. Token expires after 24 hours (default)

---

## 🚀 Complete Test Workflow

```powershell
# 1. Start server
node server.js

# 2. In another terminal, login
$login = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"username":"admin","password":"admin123"}'

$token = $login.token
$headers = @{ Authorization = "Bearer $token" }

# 3. Check status
Invoke-RestMethod -Uri "http://localhost:3000/api/status" -Headers $headers

# 4. Get devices (should be empty initially)
Invoke-RestMethod -Uri "http://localhost:3000/api/devices" -Headers $headers

# 5. Register a device
$device = @{
  device_id = "MyDevice001"
  name = "My Test Device"
  type = "Temperature"
  firmware_version = "1.0.0"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/devices" `
  -Method POST `
  -Headers $headers `
  -ContentType "application/json" `
  -Body $device

# 6. Verify device was created
Invoke-RestMethod -Uri "http://localhost:3000/api/devices" -Headers $headers

# 7. Insert some test sensor data manually
Invoke-RestMethod -Uri "http://localhost:3000/api/devices/MyDevice001/data" `
  -Headers $headers

# 8. Get system logs
Invoke-RestMethod -Uri "http://localhost:3000/api/logs?limit=10" -Headers $headers
```

---

## 📱 Next Steps

1. **Fix MQTT credentials** if needed
2. **Test with real IoT devices** sending data
3. **Build the Admin Dashboard** (React frontend)
4. **Deploy to production** server
5. **Enable HTTPS** for production

---

**BlazeIoT Solutions** - Powering the Future of Industrial IoT 🔥
