# 🔥 BlazeIoT Solutions - Industrial IoT Backend Platform

<div align="center">
  <img src="logo.jpg" alt="BlazeIoT Solutions" width="200"/>
  
  **Production-Ready Industrial IoT Backend Platform**
  
  [![Node.js](https://img.shields.io/badge/Node.js-16+-green.svg)](https://nodejs.org/)
  [![Express](https://img.shields.io/badge/Express-4.x-blue.svg)](https://expressjs.com/)
  [![MQTT](https://img.shields.io/badge/MQTT-HiveMQ-orange.svg)](https://www.hivemq.com/)
  [![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Platform](#running-the-platform)
- [API Documentation](#api-documentation)
- [WebSocket API](#websocket-api)
- [Database Schema](#database-schema)
- [Security](#security)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

---

## 🌟 Overview

**BlazeIoT Solutions Platform** is a comprehensive, production-ready Industrial IoT backend system that connects to MQTT brokers (HiveMQ Cloud), manages IoT devices and gateways, stores time-series sensor data, handles OTA firmware updates, and provides a powerful REST API and WebSocket interface for real-time monitoring and control.

### Key Highlights

✅ **Direct IoT Device Support** - ESP32, Arduino, and other MQTT-enabled devices  
✅ **Gateway-Node Architecture** - BLE/LoRa gateways with multiple sensor nodes  
✅ **Auto-Registration** - New devices and gateways register automatically  
✅ **OTA Firmware Updates** - Over-the-air update management  
✅ **Real-Time Monitoring** - WebSocket streaming for live dashboards  
✅ **RESTful API** - Comprehensive endpoints for all operations  
✅ **Secure Authentication** - JWT-based admin access  
✅ **Database Flexibility** - SQLite (development) or PostgreSQL (production)  
✅ **Scalable Architecture** - Modular, cloud-ready design  

---

## 🚀 Features

### 1. **Device & Gateway Management**
- Register and manage devices, gateways, and nodes
- Auto-register new devices when first data arrives
- Track online/offline status via MQTT connection events
- Store device metadata and firmware versions

### 2. **Data Management**
- Subscribe to MQTT topics: `SensorData/#` and `BLEGatewayData/#`
- Parse and store sensor data with timestamps
- Maintain linkage between gateways → nodes → data
- Query historical data with time filters

### 3. **OTA Update Management**
- Firmware version tracking
- Trigger OTA updates via MQTT
- Monitor update status and history
- Secure firmware file hosting

### 4. **Real-Time Streaming**
- WebSocket server for live data feeds
- Real-time device status updates
- System log streaming
- Channel-based subscriptions

### 5. **Admin Dashboard Support**
- JWT-based authentication
- Role-based access control (Admin-only)
- Comprehensive REST API
- System monitoring and logs

### 6. **Security**
- MQTT over TLS (mqtts://)
- HTTPS REST endpoints
- JWT token authentication
- Password hashing with bcrypt
- Rate limiting
- Input validation

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    BlazeIoT Platform                        │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐ │
│  │  MQTT Broker │◄───┤ MQTT Service │◄───┤   Devices    │ │
│  │  (HiveMQ)    │    │              │    │  & Gateways  │ │
│  └──────────────┘    └──────┬───────┘    └──────────────┘ │
│                             │                               │
│  ┌──────────────┐    ┌──────▼───────┐    ┌──────────────┐ │
│  │   REST API   │◄───┤   Database   │◄───┤  WebSocket   │ │
│  │   Express    │    │ SQLite/PG    │    │   Service    │ │
│  └──────┬───────┘    └──────────────┘    └──────┬───────┘ │
│         │                                         │         │
│  ┌──────▼──────────────────────────────────────▼───────┐  │
│  │             Admin Dashboard (React)                  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Module Structure

```
IoT-Backend/
├── server.js                 # Main entry point
├── package.json              # Dependencies
├── .env                      # Environment variables
├── src/
│   ├── config/
│   │   └── config.js         # Configuration management
│   ├── services/
│   │   ├── database.service.js    # DB abstraction layer
│   │   ├── mqtt.service.js        # MQTT broker connection
│   │   ├── auth.service.js        # JWT authentication
│   │   └── websocket.service.js   # WebSocket server
│   ├── routes/
│   │   └── api.routes.js          # REST API endpoints
│   └── utils/
│       ├── logger.js              # Winston logger
│       └── validators.js          # Input validation
├── scripts/
│   ├── initDatabase.js       # Database initialization
│   └── seedAdmin.js          # Create admin user
├── data/                     # SQLite database (auto-created)
├── logs/                     # Application logs (auto-created)
└── uploads/firmware/         # OTA firmware files (auto-created)
```

---

## 📦 Prerequisites

- **Node.js** >= 16.0.0
- **npm** or **yarn**
- **HiveMQ Cloud** account (or any MQTT broker)
- **PostgreSQL** (optional, for production)

---

## 🔧 Installation

### 1. Clone or Create the Project

```powershell
cd c:\Users\91902\Documents\IoT-Backend
```

### 2. Install Dependencies

```powershell
npm install
```

This will install:
- express, mqtt, sqlite3, pg, bcryptjs, jsonwebtoken, ws, dotenv, cors, helmet, express-rate-limit, express-validator, morgan, winston, uuid, multer

### 3. Configure Environment Variables

Copy the example environment file:

```powershell
Copy-Item .env.example .env
```

Edit `.env` and update your MQTT credentials:

```env
MQTT_HOST=your-hivemq-cluster.s1.eu.hivemq.cloud
MQTT_USERNAME=your_username
MQTT_PASSWORD=your_password
JWT_SECRET=your_secure_secret_key_here
```

### 4. Initialize Database

```powershell
npm run init-db
```

### 5. Create Admin User (Optional)

```powershell
npm run seed-admin
```

Follow the prompts to create your admin account.

---

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment (development/production) | `development` |
| `PORT` | HTTP server port | `3000` |
| `MQTT_HOST` | HiveMQ Cloud broker hostname | - |
| `MQTT_PORT` | MQTT broker port (TLS) | `8883` |
| `MQTT_USERNAME` | MQTT username | - |
| `MQTT_PASSWORD` | MQTT password | - |
| `JWT_SECRET` | JWT signing secret | ⚠️ **Change in production!** |
| `DB_TYPE` | Database type (sqlite/postgres) | `sqlite` |
| `ADMIN_USERNAME` | Default admin username | `admin` |
| `ADMIN_PASSWORD` | Default admin password | `admin123` |

### MQTT Topics

- **SensorData/#** - Direct IoT device data
- **BLEGatewayData/#** - Gateway-node-based data
- **OTA/+/update** - OTA update commands
- **OTA/+/response** - OTA status responses
- **CommandRequest** - Device commands

---

## 🚀 Running the Platform

### Development Mode

```powershell
npm run dev
```

Uses **nodemon** for auto-restart on file changes.

### Production Mode

```powershell
npm start
```

### Expected Output

```
============================================================
🔥 BlazeIoT Solutions Platform - Starting...
============================================================
📊 Initializing database...
✅ Database connected
👤 Checking admin user...
✅ Admin user already exists
📡 Connecting to MQTT broker...
✅ MQTT broker connected
🌐 Initializing WebSocket server...
✅ WebSocket server initialized
============================================================
🚀 Server running on http://0.0.0.0:3000
🔥 Environment: development
📡 MQTT: mqtts://your-broker:8883
🌐 WebSocket: ws://0.0.0.0:3000/ws
📊 Database: SQLITE
============================================================
✅ Platform ready! All systems operational.
============================================================
```

---

## 📚 API Documentation

### Authentication

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**
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

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Devices

#### Get All Devices
```http
GET /api/devices
Authorization: Bearer <token>
```

#### Get Device by ID
```http
GET /api/devices/:device_id
Authorization: Bearer <token>
```

#### Get Device Data
```http
GET /api/devices/:device_id/data?limit=100&offset=0
GET /api/devices/:device_id/data?start_date=2024-01-01&end_date=2024-01-31
Authorization: Bearer <token>
```

#### Register Device
```http
POST /api/devices
Authorization: Bearer <token>
Content-Type: application/json

{
  "device_id": "Device0001",
  "name": "Temperature Sensor 1",
  "type": "Temperature",
  "firmware_version": "1.0.0"
}
```

### Gateways

#### Get All Gateways
```http
GET /api/gateways
Authorization: Bearer <token>
```

#### Get Gateway Nodes
```http
GET /api/gateways/:gateway_id/nodes
Authorization: Bearer <token>
```

### OTA Updates

#### Get All Firmware
```http
GET /api/ota/firmware
Authorization: Bearer <token>
```

#### Get Latest Firmware
```http
GET /api/ota/latest?device_type=ESP32
```

#### Trigger OTA Update
```http
POST /api/ota/update
Authorization: Bearer <token>
Content-Type: application/json

{
  "device_id": "Device0001",
  "firmware_version": "1.1.0",
  "firmware_url": "https://your-server.com/firmware/v1.1.0.bin"
}
```

### Logs

#### Get System Logs
```http
GET /api/logs?category=mqtt&limit=50&offset=0
Authorization: Bearer <token>
```

### System Status

#### Get Platform Status
```http
GET /api/status
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "system": "BlazeIoT Solutions Platform",
    "version": "1.0.0",
    "status": "operational",
    "mqtt": {
      "connected": true,
      "broker": "mqtts://your-broker:8883"
    },
    "stats": {
      "devices": 5,
      "gateways": 2
    }
  }
}
```

---

## 🌐 WebSocket API

### Connection

```javascript
const token = 'your_jwt_token';
const ws = new WebSocket(`ws://localhost:3000/ws?token=${token}`);

ws.onopen = () => {
  console.log('Connected to BlazeIoT real-time stream');
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received:', data);
};
```

### Subscribe to Channels

```javascript
ws.send(JSON.stringify({
  type: 'subscribe',
  channel: 'devices'
}));
```

### Available Channels
- `devices` - Device status updates
- `gateways` - Gateway status updates
- `sensor_data` - Real-time sensor data
- `ota` - OTA update notifications
- `logs` - System logs

### Message Types

#### Device Status Update
```json
{
  "type": "device_status",
  "device_id": "Device0001",
  "status": "online",
  "timestamp": "2024-11-02T10:30:00.000Z"
}
```

#### Sensor Data Update
```json
{
  "type": "sensor_data",
  "source_type": "device",
  "source_id": "Device0001",
  "data": {
    "type": "Temperature",
    "value": 25.5
  },
  "timestamp": "2024-11-02T10:30:00.000Z"
}
```

---

## 🗄️ Database Schema

### Tables

1. **users** - Admin accounts
2. **devices** - Direct IoT devices
3. **gateways** - BLE/LoRa gateways
4. **nodes** - Sensor nodes connected to gateways
5. **sensor_data** - Time-series sensor readings
6. **firmware** - OTA firmware versions
7. **logs** - System event logs
8. **ota_history** - OTA update tracking

### Relationships

```
gateways (1) ──< (N) nodes
devices/nodes (1) ──< (N) sensor_data
firmware (1) ──< (N) ota_history
```

---

## 🔒 Security

### Best Practices

1. **Change Default Credentials**
   ```powershell
   npm run seed-admin
   ```

2. **Use Strong JWT Secret**
   ```env
   JWT_SECRET=use_a_very_long_random_string_here
   ```

3. **Enable HTTPS in Production**
   - Use reverse proxy (nginx/Apache)
   - Let's Encrypt SSL certificates

4. **Restrict CORS Origins**
   ```env
   CORS_ORIGIN=https://yourdashboard.com
   ```

5. **Use PostgreSQL in Production**
   ```env
   DB_TYPE=postgres
   POSTGRES_HOST=your-db-host
   POSTGRES_USER=blazeiot
   POSTGRES_PASSWORD=secure_password
   ```

---

## 🚢 Deployment

### AWS EC2 / Azure VM

1. Install Node.js and PostgreSQL
2. Clone repository
3. Set environment variables
4. Run with PM2:
   ```bash
   npm install -g pm2
   pm2 start server.js --name blazeiot-backend
   pm2 save
   pm2 startup
   ```

### Docker (Coming Soon)

```dockerfile
# Dockerfile example
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```

### Heroku

```bash
heroku create blazeiot-backend
heroku addons:create heroku-postgresql:hobby-dev
git push heroku main
```

---

## 🐛 Troubleshooting

### MQTT Connection Issues

**Problem:** `Connection refused: Not authorized`

**Solution:**
- Verify HiveMQ Cloud credentials in `.env`
- Check MQTT_HOST, MQTT_USERNAME, MQTT_PASSWORD
- Ensure port 8883 is open (TLS)

### Database Errors

**Problem:** `SQLITE_CANTOPEN: unable to open database file`

**Solution:**
```powershell
npm run init-db
```

### WebSocket Connection Failed

**Problem:** `WebSocket connection to 'ws://...' failed`

**Solution:**
- Check JWT token is valid
- Verify WebSocket URL includes `?token=<jwt_token>`
- Check server logs for authentication errors

### Port Already in Use

**Problem:** `EADDRINUSE: address already in use :::3000`

**Solution:**
```powershell
# Find and kill process using port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file

---

## 🤝 Support

For issues, questions, or contributions:

- 📧 Email: support@blazeiot.com
- 🌐 Website: https://blazeiot.com
- 📱 GitHub: [BlazeIoT Solutions](https://github.com/blazeiot)

---

<div align="center">
  <strong>Built with ❤️ by BlazeIoT Solutions</strong>
  <br>
  <em>Powering the Future of Industrial IoT</em>
</div>
