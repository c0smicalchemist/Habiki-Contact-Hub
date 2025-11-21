# Ibiki SMS Development Workflow

This document outlines the development workflow for the Ibiki SMS application, including how to use Railway for development testing and deploy to production.

## Branch Structure

### `main` branch
- **Purpose**: Production-ready code
- **Deployment**: Manual deployment to production Linux server
- **Protection**: Protected branch, requires pull request reviews
- **Testing**: Thoroughly tested features only

### `development` branch  
- **Purpose**: Development and testing of new features
- **Deployment**: Automatic deployment to Railway for live testing
- **Testing**: Integration testing, feature validation
- **Access**: Development team can push directly for rapid iteration

## Development Environment Setup

### Railway Development Environment

Railway provides a live development environment for testing new features before production deployment.

#### Initial Railway Setup

1. **Connect Repository to Railway**
   ```bash
   # In Railway dashboard:
   # 1. Create new project
   # 2. Connect GitHub repository
   # 3. Select 'development' branch for deployment
   # 4. Railway will auto-detect Node.js and use nixpacks.toml
   ```

2. **Add PostgreSQL Database**
   ```bash
   # In Railway project:
   # 1. Click "Add Service" 
   # 2. Select "Database" → "PostgreSQL"
   # 3. Railway will automatically set DATABASE_URL environment variable
   ```

3. **Configure Environment Variables**
   ```bash
   # Required Railway environment variables:
   NODE_ENV=development
   SESSION_SECRET=your-railway-session-secret
   JWT_SECRET=your-railway-jwt-secret
   RESEND_API_KEY=your-resend-api-key
   EXTREMESMS_API_KEY=your-extremesms-api-key
   EXTREMESMS_SENDER_ID=your-sender-id
   ```

#### Railway Configuration Files

- `railway.json`: Railway deployment configuration
- `nixpacks.toml`: Build configuration for Railway
- `.env.development`: Development environment template

## Development Workflow

### 1. Feature Development

```bash
# Start new feature development
git checkout development
git pull origin development

# Create feature branch (optional, for complex features)
git checkout -b feature/new-sms-template

# Develop and test locally
npm run dev

# Test with local PostgreSQL
npm run db:migrate
npm run db:seed  # if you have seed data
```

### 2. Testing on Railway

```bash
# Push to development branch for Railway testing
git checkout development
git merge feature/new-sms-template  # or work directly on development
git push origin development

# Railway will automatically:
# 1. Build the application
# 2. Run database migrations
# 3. Deploy to development URL
# 4. Provide live testing environment
```

### 3. Railway Testing Checklist

- [ ] Application builds successfully
- [ ] Database migrations run without errors
- [ ] Health endpoint returns healthy status
- [ ] User registration/login works
- [ ] SMS functionality works (if configured)
- [ ] API endpoints respond correctly
- [ ] Frontend loads and functions properly
- [ ] No console errors in browser

### 4. Production Deployment

```bash
# After thorough testing on Railway development environment
git checkout main
git merge development
git push origin main

# Deploy to production server using deployment package
# See DEPLOYMENT_CHECKLIST.md for production deployment steps
```

## Environment Differences

### Development (Railway)
- **Database**: Railway PostgreSQL addon
- **Environment**: `NODE_ENV=development`
- **Logging**: Debug level logging enabled
- **Hot Reload**: Available during local development
- **SSL**: Provided by Railway
- **Domain**: Railway-provided subdomain

### Production (Linux Server)
- **Database**: Self-hosted PostgreSQL
- **Environment**: `NODE_ENV=production`
- **Logging**: Info level logging
- **Process Manager**: PM2
- **SSL**: Self-managed (Let's Encrypt recommended)
- **Domain**: Your production domain

## Railway Commands and Monitoring

### Useful Railway CLI Commands

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Link to your project
railway link

# View logs
railway logs

# Run commands in Railway environment
railway run npm run db:migrate

# Open Railway dashboard
railway open
```

### Monitoring Development Environment

1. **Railway Dashboard**: Monitor deployments, logs, and metrics
2. **Health Endpoint**: `https://your-railway-app.railway.app/api/health`
3. **Database Metrics**: Available in Railway PostgreSQL service
4. **Application Logs**: Real-time logs in Railway dashboard

## Database Management

### Development Database (Railway)

```bash
# Connect to Railway PostgreSQL
railway connect postgres

# Run migrations on Railway
railway run npm run db:migrate

# Reset development database (if needed)
railway run npm run db:reset
```

### Production Database (Linux Server)

```bash
# Connect to production database
psql $DATABASE_URL

# Run migrations on production
npm run db:migrate

# Backup production database
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql
```

## Testing Strategy

### 1. Local Development Testing
- Unit tests: `npm test`
- Integration tests: `npm run test:integration`
- Local database testing

### 2. Railway Development Testing
- End-to-end functionality testing
- API endpoint testing
- Database integration testing
- SMS functionality testing (with test credentials)

### 3. Production Testing
- Smoke tests after deployment
- Performance monitoring
- Security validation
- Backup and recovery testing

## Troubleshooting

### Common Railway Issues

1. **Build Failures**
   ```bash
   # Check build logs in Railway dashboard
   # Verify package.json scripts
   # Check Node.js version compatibility
   ```

2. **Database Connection Issues**
   ```bash
   # Verify PostgreSQL addon is added
   # Check DATABASE_URL environment variable
   # Review connection logs
   ```

3. **Environment Variable Issues**
   ```bash
   # Verify all required variables are set in Railway
   # Check variable names match exactly
   # Restart deployment after variable changes
   ```

### Common Production Issues

1. **PM2 Process Issues**
   ```bash
   pm2 status
   pm2 logs ibiki-sms
   pm2 restart ibiki-sms
   ```

2. **Database Connection Issues**
   ```bash
   # Check PostgreSQL service status
   sudo systemctl status postgresql
   
   # Test database connection
   psql $DATABASE_URL -c "SELECT version();"
   ```

## Security Considerations

### Development Environment
- Use separate API keys for development
- Limit SMS credits for development testing
- Use test email addresses
- Regular security updates

### Production Environment
- Strong database passwords
- SSL/TLS encryption
- Regular security patches
- Backup encryption
- Access logging

## Deployment Checklist

### Before Pushing to Development
- [ ] Code compiles without errors
- [ ] Local tests pass
- [ ] Database migrations are included
- [ ] Environment variables are documented

### Before Promoting to Production
- [ ] Railway development testing completed
- [ ] All features working as expected
- [ ] Performance testing completed
- [ ] Security review completed
- [ ] Database migrations tested
- [ ] Backup strategy confirmed

### After Production Deployment
- [ ] Health checks pass
- [ ] Monitoring alerts configured
- [ ] Performance metrics baseline established
- [ ] Team notified of deployment