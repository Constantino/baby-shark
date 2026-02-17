#!/bin/bash
# EC2 Initial Setup Script for Baby Shark API
# Run this once on your fresh EC2 instance

set -e

echo "🦈 Baby Shark API - EC2 Setup"
echo "================================"

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
echo "📦 Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify Node.js installation
echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"

# Install PM2 globally
echo "📦 Installing PM2..."
sudo npm install -g pm2

# Setup PM2 startup script
echo "⚙️  Setting up PM2 to start on boot..."
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu

# Create app directory
echo "📁 Creating app directory..."
sudo mkdir -p /app/baby-shark
sudo chown ubuntu:ubuntu /app/baby-shark

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Add GitHub secrets (see .github/DEPLOYMENT.md)"
echo "2. Push to main branch"
echo "3. GitHub Actions will deploy automatically"
echo ""
echo "Or deploy manually:"
echo "  cd /app/baby-shark"
echo "  # Upload your built files here"
echo "  npm ci --omit=dev"
echo "  pm2 start dist/main.js --name baby-shark-api"
echo "  pm2 save"
