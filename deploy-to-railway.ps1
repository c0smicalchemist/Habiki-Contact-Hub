# 🚂 Habiki Contact Hub - Railway Deployment Script (PowerShell)
# This script automates the deployment to Railway on Windows

Write-Host "🚀 Starting Habiki Contact Hub Railway Deployment..." -ForegroundColor Green

# Check if Railway CLI is installed
if (!(Get-Command railway -ErrorAction SilentlyContinue)) {
    Write-Host "📦 Installing Railway CLI..." -ForegroundColor Yellow
    npm install -g @railway/cli
}

# Login to Railway
Write-Host "🔐 Logging into Railway..." -ForegroundColor Yellow
railway login

# Check if project exists
Write-Host "🔍 Checking for existing Railway project..." -ForegroundColor Yellow
$railwayStatus = railway status 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Existing Railway project found" -ForegroundColor Green
} else {
    Write-Host "🆕 Creating new Railway project..." -ForegroundColor Yellow
    railway init --name "habiki-contact-hub"
}

# Add PostgreSQL database
Write-Host "🗄️ Adding PostgreSQL database..." -ForegroundColor Yellow
railway add --database --name "habiki-contact-hub-db"

# Set required environment variables
Write-Host "⚙️ Setting environment variables..." -ForegroundColor Yellow
railway variables set NODE_ENV=production

# Generate secure secrets
$jwtSecret = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes([System.Guid]::NewGuid().ToString() + [System.Guid]::NewGuid().ToString()))
$sessionSecret = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes([System.Guid]::NewGuid().ToString() + [System.Guid]::NewGuid().ToString()))

railway variables set JWT_SECRET="$jwtSecret"
railway variables set SESSION_SECRET="$sessionSecret"
railway variables set CORS_ORIGIN="https://$env:RAILWAY_PUBLIC_DOMAIN"
railway variables set TRUST_PROXY=true

# Optional: Set demo configuration
Write-Host "🔑 Setting up demo configuration..." -ForegroundColor Yellow
railway variables set RATE_LIMIT_WINDOW_MS=900000
railway variables set RATE_LIMIT_MAX_REQUESTS=100
railway variables set SCRAPING_RATE_LIMIT_DELAY=2000
railway variables set MAX_SCRAPING_THREADS=5
railway variables set MAX_EXPORT_RECORDS=10000
railway variables set EXPORT_BATCH_SIZE=1000

# Deploy the application
Write-Host "🚀 Deploying to Railway..." -ForegroundColor Yellow
railway up

# Get deployment info
Write-Host "📋 Deployment Information:" -ForegroundColor Green
railway status

Write-Host ""
Write-Host "🎉 SUCCESS! Habiki Contact Hub deployed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "🔗 Application URLs:" -ForegroundColor Cyan
Write-Host "   Main App: https://$env:RAILWAY_PUBLIC_DOMAIN" -ForegroundColor White
Write-Host "   Login: https://$env:RAILWAY_PUBLIC_DOMAIN/login" -ForegroundColor White
Write-Host "   Admin: https://$env:RAILWAY_PUBLIC_DOMAIN/admin" -ForegroundColor White
Write-Host "   Test System: https://$env:RAILWAY_PUBLIC_DOMAIN/test-system.html" -ForegroundColor White
Write-Host ""
Write-Host "👤 Demo Credentials:" -ForegroundColor Cyan
Write-Host "   Admin: admin@habiki.com / admin123" -ForegroundColor White
Write-Host "   User: user@habiki.com / user123" -ForegroundColor White
Write-Host ""
Write-Host "⚙️ Next Steps:" -ForegroundColor Yellow
Write-Host "   1. Configure social media API keys in Railway dashboard" -ForegroundColor White
Write-Host "   2. Set up email service (optional)" -ForegroundColor White
Write-Host "   3. Test all functionality" -ForegroundColor White
Write-Host "   4. Monitor logs in Railway dashboard" -ForegroundColor White
Write-Host ""
Write-Host "📚 Documentation:" -ForegroundColor Cyan
Write-Host "   Railway Guide: RAILWAY_DEPLOYMENT_GUIDE.md" -ForegroundColor White
Write-Host "   GitHub Repo: https://github.com/c0smicalchemist/Habiki-Contact-Hub" -ForegroundColor White

Write-Host ""
Write-Host "✨ Deployment complete! Your Habiki Contact Hub is now live on Railway!" -ForegroundColor Green