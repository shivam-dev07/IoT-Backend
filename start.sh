#!/bin/bash

###############################################################################
# Quick Start Script - Run this after deployment
###############################################################################

set -e

echo "🔥 Starting BlazeIoT Backend..."

cd ~/IoT-Backend

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Run: cp .env.production .env && nano .env"
    exit 1
fi

# Start with PM2
pm2 start ecosystem.config.js --env production
pm2 save

echo ""
echo "✅ Application started!"
echo ""
pm2 status
echo ""
echo "📊 View logs: pm2 logs blazeiot-backend"
echo "🌐 Access: http://$(curl -s ifconfig.me):3000"
