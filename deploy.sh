#!/bin/bash

###############################################################################
# BlazeIoT Backend - Automated Deployment Script for Google Cloud
# This script automates the deployment process on a fresh Ubuntu 22.04 instance
###############################################################################

set -e  # Exit on any error

echo "🔥 BlazeIoT Backend - GCP Deployment Script"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
    echo -e "${RED}❌ Please do not run this script as root${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} Starting deployment process..."
echo ""

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x
echo "📦 Installing Node.js 20.x..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
    echo -e "${GREEN}✓${NC} Node.js installed: $(node --version)"
else
    echo -e "${YELLOW}⚠${NC} Node.js already installed: $(node --version)"
fi

# Install PM2
echo "📦 Installing PM2..."
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
    echo -e "${GREEN}✓${NC} PM2 installed"
else
    echo -e "${YELLOW}⚠${NC} PM2 already installed"
fi

# Install Git
echo "📦 Installing Git..."
if ! command -v git &> /dev/null; then
    sudo apt install -y git
    echo -e "${GREEN}✓${NC} Git installed"
else
    echo -e "${YELLOW}⚠${NC} Git already installed"
fi

# Navigate to home directory
cd ~

# Check if repository exists
if [ -d "IoT-Backend" ]; then
    echo -e "${YELLOW}⚠${NC} Repository already exists. Updating..."
    cd IoT-Backend
    git pull
else
    echo "📥 Cloning repository..."
    git clone https://github.com/shivam-dev07/IoT-Backend.git
    cd IoT-Backend
fi

# Install dependencies
echo "📦 Installing Node.js dependencies..."
npm install --production

# Setup environment file
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.production .env
    echo -e "${YELLOW}⚠ IMPORTANT: Edit .env file and update:${NC}"
    echo "  - JWT_SECRET"
    echo "  - ADMIN_PASSWORD"
    echo "  - CORS_ORIGIN (add your GCP IP)"
    echo ""
    echo -e "${YELLOW}Run: nano .env${NC}"
    echo ""
else
    echo -e "${YELLOW}⚠${NC} .env file already exists"
fi

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p logs uploads/firmware data

# Get external IP
EXTERNAL_IP=$(curl -s ifconfig.me)
echo ""
echo -e "${GREEN}✓${NC} Your GCP External IP: ${GREEN}$EXTERNAL_IP${NC}"
echo ""

# Display firewall instructions
echo "🔥 FIREWALL CONFIGURATION REQUIRED:"
echo "Run this command on your LOCAL machine (not on GCP instance):"
echo ""
echo -e "${YELLOW}gcloud compute firewall-rules create allow-blazeiot-backend --allow tcp:3000,tcp:3001 --source-ranges 0.0.0.0/0${NC}"
echo ""
echo "Or configure manually in Google Cloud Console:"
echo "  VPC Network → Firewall → CREATE FIREWALL RULE"
echo "  - Name: allow-blazeiot-backend"
echo "  - Protocols/ports: tcp:3000,tcp:3001"
echo ""

# Ask if user wants to start the app now
read -p "Do you want to start the application now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 Starting application with PM2..."
    pm2 start ecosystem.config.js --env production
    pm2 save
    
    # Setup PM2 startup
    echo "⚙️ Setting up PM2 to start on boot..."
    PM2_STARTUP=$(pm2 startup | tail -n 1)
    eval $PM2_STARTUP
    
    echo ""
    echo -e "${GREEN}✓${NC} Application started!"
    echo ""
    pm2 status
    echo ""
    echo "📊 View logs: pm2 logs blazeiot-backend"
    echo "🔄 Restart: pm2 restart blazeiot-backend"
    echo ""
fi

echo ""
echo "=========================================="
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo "=========================================="
echo ""
echo "🌐 Access your application at:"
echo -e "   ${GREEN}http://$EXTERNAL_IP:3000${NC}"
echo ""
echo "📋 Next steps:"
echo "  1. Update .env file: nano .env"
echo "  2. Configure firewall rules (see above)"
echo "  3. Add GCP IP to MongoDB Atlas whitelist"
echo "  4. Test: curl http://localhost:3000/api/health"
echo ""
echo "📖 Full documentation: cat DEPLOYMENT.md"
echo ""
