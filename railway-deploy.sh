#!/bin/bash

# Railway Deployment Script
# This script helps deploy to Railway with automatic environment variable setup

echo "🚂 Railway Deployment Script"
echo "=============================="

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Login check
echo "🔐 Checking Railway authentication..."
if ! railway whoami &> /dev/null; then
    echo "❌ Not logged in to Railway. Please run: railway login"
    exit 1
fi

echo "✅ Railway CLI authenticated"

# Set environment variables from .env.railway if it exists
if [ -f ".env.railway" ]; then
    echo "📝 Setting environment variables from .env.railway..."
    
    # Read each line from .env.railway and set as Railway variable
    while IFS='=' read -r key value; do
        # Skip comments and empty lines
        if [[ $key =~ ^[[:space:]]*# ]] || [[ -z "$key" ]]; then
            continue
        fi
        
        # Remove any quotes from value
        value=$(echo "$value" | sed 's/^"//;s/"$//')
        
        echo "Setting $key..."
        railway variables set "$key=$value"
    done < .env.railway
    
    echo "✅ Environment variables set from .env.railway"
else
    echo "⚠️  .env.railway not found - using railway.json variables only"
fi

# Add DATABASE_URL reference (this needs to be done manually in Railway UI)
echo "📊 Setting up DATABASE_URL reference..."
echo "⚠️  IMPORTANT: You need to manually add DATABASE_URL in Railway UI:"
echo "   1. Go to your Railway project Variables tab"
echo "   2. Click 'Add' button"
echo "   3. Set VARIABLE_NAME: DATABASE_URL"
echo "   4. Set VALUE: Click 'Add Reference' → Select DATABASE_URL from PostgreSQL service"

# Deploy
echo "🚀 Deploying to Railway..."
railway up

echo "✅ Deployment complete!"
echo "🌐 Check your Railway dashboard for deployment status"