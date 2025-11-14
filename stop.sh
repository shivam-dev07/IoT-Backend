#!/bin/bash

###############################################################################
# Stop Script
###############################################################################

echo "🛑 Stopping BlazeIoT Backend..."
pm2 stop blazeiot-backend
pm2 save
echo "✅ Application stopped"
