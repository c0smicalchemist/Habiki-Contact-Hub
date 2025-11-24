#!/bin/bash

# 🚂 Habiki Contact Hub - Railway Deployment Script
# This script automates the deployment to Railway

set -e

echo "🚀 Starting Habiki Contact Hub Railway Deployment..."

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "📦 Installing Railway CLI..."
    npm install -g @railway/cli
fi

# Login to Railway
echo "🔐 Logging into Railway..."
railway login

# Check if project exists
echo "🔍 Checking for existing Railway project..."
if railway status &> /dev/null; then
    echo "✅ Existing Railway project found"
else
    echo "🆕 Creating new Railway project..."
    railway init --name "habiki-contact-hub"
fi

# Add PostgreSQL database
echo "🗄️ Adding PostgreSQL database..."
railway add --database --name "habiki-contact-hub-db" || echo "⚠️ Database may already exist"

# Set required environment variables
echo "⚙️ Setting environment variables..."
railway variables set NODE_ENV=production

# Generate secure secrets
JWT_SECRET=$(openssl rand -base64 32)
SESSION_SECRET=$(openssl rand -base64 32)

railway variables set JWT_SECRET="$JWT_SECRET"
railway variables set SESSION_SECRET="$SESSION_SECRET"
railway variables set CORS_ORIGIN="https://${RAILWAY_PUBLIC_DOMAIN:-localhost}"
railway variables set TRUST_PROXY=true

# Optional: Set demo social media API keys (user can update these later)
echo "🔑 Setting up demo API configuration (you can update these in Railway dashboard)..."
railway variables set RATE_LIMIT_WINDOW_MS=900000
railway variables set RATE_LIMIT_MAX_REQUESTS=100
railway variables set SCRAPING_RATE_LIMIT_DELAY=2000
railway variables set MAX_SCRAPING_THREADS=5
railway variables set MAX_EXPORT_RECORDS=10000
railway variables set EXPORT_BATCH_SIZE=1000

# Deploy the application
echo "🚀 Deploying to Railway..."
railway up

# Get deployment info
echo "📋 Deployment Information:"
railway status

# Get the deployment URL
DEPLOYMENT_URL=$(railway status | grep -o 'https://[^[:space:]]*' | head -1)

if [ -n "$DEPLOYMENT_URL" ]; then
    echo ""
    echo "🎉 SUCCESS! Habiki Contact Hub deployed successfully!"
    echo ""
    echo "🔗 Application URLs:"
    echo "   Main App: $DEPLOYMENT_URL"
    echo "   Login: $DEPLOYMENT_URL/login"
    echo "   Admin: $DEPLOYMENT_URL/admin"
    echo "   Test System: $DEPLOYMENT_URL/test-system.html"
    echo ""
    echo "👤 Demo Credentials:"
    echo "   Admin: admin@habiki.com / admin123"
    echo "   User: user@habiki.com / user123"
    echo ""
    echo "⚙️ Next Steps:"
    echo "   1. Configure social media API keys in Railway dashboard"
    echo "   2. Set up email service (optional)"
    echo "   3. Test all functionality"
    echo "   4. Monitor logs in Railway dashboard"
    echo ""
    echo "📚 Documentation:"
    echo "   Railway Guide: RAILWAY_DEPLOYMENT_GUIDE.md"
    echo "   GitHub Repo: https://github.com/c0smicalchemist/Habiki-Contact-Hub"
else
    echo "⚠️ Could not retrieve deployment URL. Check Railway dashboard for details."
fi

echo ""
echo "✨ Deployment complete! Your Habiki Contact Hub is now live on Railway!"