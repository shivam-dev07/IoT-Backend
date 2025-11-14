#!/bin/bash

###############################################################################
# Build and Deploy Dashboard to GCP
# Run this script on your LOCAL machine after making frontend changes
###############################################################################

echo "🏗️  Building React Dashboard..."

# Build the dashboard
cd admin-dashboard
npm run build

echo "✅ Dashboard built successfully!"
echo ""
echo "📦 Deploying to GCP..."

# Copy built files to GCP instance
# Replace with your GCP instance details
GCP_USER="sv520413"
GCP_HOST="34.121.79.183"
GCP_PATH="~/IoT-Backend/admin-dashboard/dist"

echo "Uploading files to $GCP_USER@$GCP_HOST..."

# Create directory on GCP if it doesn't exist
ssh $GCP_USER@$GCP_HOST "mkdir -p $GCP_PATH"

# Copy files
scp -r dist/* $GCP_USER@$GCP_HOST:$GCP_PATH/

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🔄 Restarting backend on GCP..."

# Restart PM2
ssh $GCP_USER@$GCP_HOST "cd ~/IoT-Backend && pm2 restart blazeiot-backend"

echo ""
echo "=========================================="
echo "✅ Dashboard Deployed Successfully!"
echo "=========================================="
echo ""
echo "🌐 Access your dashboard at:"
echo "   http://34.121.79.183:3000"
echo ""
echo "📊 Check status: ssh $GCP_USER@$GCP_HOST 'pm2 status'"
echo "📝 View logs: ssh $GCP_USER@$GCP_HOST 'pm2 logs blazeiot-backend'"
echo ""
