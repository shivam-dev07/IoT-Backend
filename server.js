/**
 * BlazeIoT Solutions - Main Server Entry Point
 * Industrial IoT Backend Platform
 */

const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');

// Import configuration and services
const config = require('./src/config/config');
const logger = require('./src/utils/logger');
const dbService = require('./src/services/database.service');
const mqttService = require('./src/services/mqtt.service');
const wsService = require('./src/services/websocket.service');
const authService = require('./src/services/auth.service');
const activityMonitor = require('./src/services/activity-monitor.service');
const apiRoutes = require('./src/routes/api.routes');

// Create Express app
const app = express();

// Create HTTP server
const server = http.createServer(app);

// ==================== Middleware ====================

// Security headers
app.use(helmet({
  contentSecurityPolicy: false, // Disable for development
}));

// CORS
app.use(cors({
  origin: config.security.corsOrigin,
  credentials: true,
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
if (config.server.env !== 'production') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  }));
}

// Rate limiting (increased for real-time IoT dashboard)
const limiter = rateLimit({
  windowMs: config.security.rateLimitWindowMs, // 15 minutes
  max: 1000, // Increased from 100 to 1000 requests per window
  message: {
    success: false,
    message: 'Too many requests, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for websocket upgrade requests
    return req.headers.upgrade === 'websocket';
  },
});

app.use('/api/', limiter);

// ==================== Routes ====================

// API routes
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Serve static files for firmware uploads
const uploadsDir = config.upload.dir;
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/firmware', express.static(uploadsDir));

// Serve static files from React build (admin dashboard)
const dashboardPath = path.join(__dirname, 'admin-dashboard', 'dist');
if (fs.existsSync(dashboardPath)) {
  app.use(express.static(dashboardPath));
  
  // Handle React routing - serve index.html for all non-API routes
  app.get('*', (req, res) => {
    // Skip API and static routes
    if (req.path.startsWith('/api') || 
        req.path.startsWith('/firmware') || 
        req.path === '/health') {
      return res.status(404).json({ 
        success: false, 
        message: 'Endpoint not found' 
      });
    }
    res.sendFile(path.join(dashboardPath, 'index.html'));
  });
} else {
  // Fallback if dashboard not built
  app.get('/', (req, res) => {
    res.json({
      name: 'BlazeIoT Solutions Platform',
      version: '1.0.0',
      description: 'Industrial IoT Backend Platform',
      endpoints: {
        api: '/api',
        health: '/health',
        websocket: '/ws',
      },
      note: 'Admin dashboard not built. Run: cd admin-dashboard && npm run build'
    });
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Express error:', err);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(config.server.env !== 'production' && { stack: err.stack }),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// ==================== Server Initialization ====================

/**
 * Initialize all services and start the server
 */
async function startServer() {
  try {
    logger.info('='.repeat(60));
    logger.info(`🔥 BlazeIoT Solutions Platform - Starting...`);
    logger.info('='.repeat(60));

    // Initialize database
    logger.info('📊 Initializing database...');
    await dbService.connect();
    logger.info('✅ Database connected');

    // Create default admin user if not exists
    logger.info('👤 Checking admin user...');
    const adminExists = await dbService.getUserByUsername(config.admin.username);
    if (!adminExists) {
      await authService.createAdminUser(
        config.admin.username,
        config.admin.password,
        config.admin.email
      );
      logger.info(`✅ Admin user created: ${config.admin.username}`);
      logger.warn(`⚠️  Default password: ${config.admin.password} - CHANGE THIS IMMEDIATELY!`);
    } else {
      logger.info('✅ Admin user already exists');
    }

    // Initialize MQTT service
    logger.info('📡 Connecting to MQTT broker...');
    try {
      await mqttService.connect();
      logger.info('✅ MQTT broker connected');
    } catch (error) {
      logger.error('⚠️  MQTT connection failed - server will continue without MQTT', error.message);
      logger.warn('Please check MQTT credentials in .env file');
      logger.warn('The platform will operate in API-only mode until MQTT is configured');
    }

    // Initialize WebSocket service
    logger.info('🌐 Initializing WebSocket server...');
    wsService.initialize(server);
    logger.info('✅ WebSocket server initialized');

    // Link MQTT and WebSocket services
    mqttService.setWebSocketServer(wsService);

    // Start activity monitoring (auto-offline detection)
    logger.info('⏱️  Starting activity monitor (5 min timeout)...');
    activityMonitor.start();
    logger.info('✅ Activity monitor started');

    // Start HTTP server
    server.listen(config.server.port, config.server.host, () => {
      logger.info('='.repeat(60));
      logger.info(`🚀 Server running on http://${config.server.host}:${config.server.port}`);
      logger.info(`🔥 Environment: ${config.server.env}`);
      logger.info(`📡 MQTT: ${config.mqtt.protocol}://${config.mqtt.host}:${config.mqtt.port}`);
      logger.info(`🌐 WebSocket: ws://${config.server.host}:${config.server.port}/ws`);
      logger.info(`📊 Database: ${config.database.type.toUpperCase()}`);
      logger.info(`⏱️  Activity Monitor: 5-minute timeout`);
      logger.info('='.repeat(60));
      logger.info('✅ Platform ready! All systems operational.');
      logger.info('='.repeat(60));
    });

  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// ==================== Graceful Shutdown ====================

/**
 * Handle graceful shutdown
 */
async function gracefulShutdown(signal) {
  logger.info(`\n${signal} received. Starting graceful shutdown...`);

  try {
    // Close HTTP server
    server.close(() => {
      logger.info('✅ HTTP server closed');
    });

    // Close WebSocket server
    wsService.close();
    logger.info('✅ WebSocket server closed');

    // Stop activity monitor
    activityMonitor.stop();
    logger.info('✅ Activity monitor stopped');

    // Disconnect MQTT
    await mqttService.disconnect();
    logger.info('✅ MQTT disconnected');

    // Close database
    await dbService.close();
    logger.info('✅ Database closed');

    logger.info('✅ Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    logger.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
}

// Handle termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('UNHANDLED_REJECTION');
});

// ==================== Start the Server ====================

startServer();

// Export for testing
module.exports = { app, server };
