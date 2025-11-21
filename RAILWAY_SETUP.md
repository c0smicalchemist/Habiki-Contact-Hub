# Railway Development Environment Setup

This guide will help you set up Railway for continuous development testing of the Ibiki SMS application.

## Prerequisites

- GitHub repository with the Ibiki SMS code
- Railway account (free tier available)
- Basic understanding of environment variables

## Step 1: Create Railway Project

1. **Sign up/Login to Railway**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub (recommended for easy repo integration)

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your `c0smicalchemist/Ibiki_SMS_Development_Build` repository
   - Select the `development` branch

## Step 2: Add PostgreSQL Database

1. **Add Database Service**
   - In your Railway project dashboard
   - Click "Add Service" → "Database" → "PostgreSQL"
   - Railway will automatically provision a PostgreSQL database
   - The `DATABASE_URL` environment variable will be automatically set

2. **Verify Database Connection**
   - Go to the PostgreSQL service in your Railway dashboard
   - Note the connection details (host, port, database name, user, password)
   - The `DATABASE_URL` will be in format: `postgresql://user:password@host:port/database`

## Step 3: Configure Environment Variables

In your Railway project settings, add these environment variables:

### Required Variables
```bash
NODE_ENV=development
SESSION_SECRET=railway-dev-session-secret-change-this
JWT_SECRET=railway-dev-jwt-secret-change-this
```

### Optional Variables (for full functionality)
```bash
# Email service (for password reset functionality)
RESEND_API_KEY=your-resend-api-key-here

# SMS service (for SMS functionality)
EXTREMESMS_API_KEY=your-extremesms-api-key-here
EXTREMESMS_SENDER_ID=your-sender-id-here

# Debug settings
DEBUG=true
LOG_LEVEL=debug
```

### How to Add Variables
1. Go to your Railway project dashboard
2. Click on your service (the main app, not the database)
3. Go to "Variables" tab
4. Click "Add Variable"
5. Enter variable name and value
6. Click "Add"

## Step 4: Configure Deployment Settings

Railway should automatically detect your Node.js application and use the provided configuration files:

- `railway.json`: Railway-specific deployment configuration
- `nixpacks.toml`: Build configuration
- `package.json`: Node.js dependencies and scripts

### Verify Build Configuration
1. Check that Railway detected Node.js 20.x
2. Verify build command: `npm install && npm run build`
3. Verify start command: `node dist/index.js`

## Step 5: Deploy and Test

1. **Trigger Deployment**
   - Push any change to the `development` branch
   - Railway will automatically build and deploy
   - Monitor the build logs in Railway dashboard

2. **Check Deployment Status**
   - Go to "Deployments" tab in Railway
   - Verify the deployment succeeded
   - Check build logs for any errors

3. **Test the Application**
   - Click on your service URL (Railway provides a public URL)
   - Test the health endpoint: `https://your-app.railway.app/api/health`
   - Verify the web interface loads
   - Test user registration/login

## Step 6: Database Migration

After successful deployment, run database migrations:

1. **Using Railway CLI** (recommended)
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login and link to your project
   railway login
   railway link
   
   # Run migrations
   railway run npm run db:migrate
   ```

2. **Using Railway Dashboard**
   - Go to your service in Railway dashboard
   - Click "Deploy" → "Custom Start Command"
   - Temporarily change start command to: `npm run db:migrate && node dist/index.js`
   - Deploy once, then change back to: `node dist/index.js`

## Step 7: Set Up Automatic Deployments

Railway automatically deploys when you push to the connected branch (`development`).

### Deployment Workflow
1. Make changes to your code
2. Push to `development` branch
3. Railway automatically builds and deploys
4. Test your changes on the live Railway URL
5. When satisfied, merge to `main` for production deployment

## Monitoring and Debugging

### View Logs
- Railway Dashboard → Your Service → "Logs" tab
- Real-time logs show application output and errors

### Health Monitoring
- Use the health endpoint: `/api/health`
- Should return JSON with database status and user count

### Database Access
- Railway Dashboard → PostgreSQL Service → "Connect"
- Use provided connection details to connect with psql or database client

## Environment Variables Reference

### Development Environment Variables
```bash
# Core Application
NODE_ENV=development
PORT=5000  # Railway sets this automatically

# Database (set automatically by Railway PostgreSQL addon)
DATABASE_URL=postgresql://user:password@host:port/database

# Security (generate strong secrets for development)
SESSION_SECRET=your-railway-session-secret
JWT_SECRET=your-railway-jwt-secret

# Email Service (optional, for testing email features)
RESEND_API_KEY=your-resend-api-key

# SMS Service (optional, for testing SMS features)
EXTREMESMS_API_KEY=your-extremesms-api-key
EXTREMESMS_SENDER_ID=your-sender-id

# Debug Settings
DEBUG=true
LOG_LEVEL=debug
```

## Troubleshooting

### Common Issues

1. **Build Fails**
   - Check Node.js version (should be 20.x)
   - Verify all dependencies are in package.json
   - Check build logs for specific errors

2. **Database Connection Fails**
   - Verify PostgreSQL addon is added to project
   - Check that DATABASE_URL is set automatically
   - Ensure database migrations have been run

3. **Application Won't Start**
   - Check start command: `node dist/index.js`
   - Verify build completed successfully
   - Check application logs for startup errors

4. **Environment Variables Not Working**
   - Verify variables are set in Railway dashboard
   - Check variable names match exactly (case-sensitive)
   - Redeploy after adding new variables

### Getting Help

1. **Railway Documentation**: [docs.railway.app](https://docs.railway.app)
2. **Railway Discord**: Community support
3. **Application Logs**: Check Railway dashboard logs
4. **Health Endpoint**: Test `/api/health` for application status

## Next Steps

After Railway setup is complete:

1. **Test Development Workflow**
   - Make a small change to the code
   - Push to `development` branch
   - Verify automatic deployment works
   - Test the change on Railway URL

2. **Set Up Production Deployment**
   - Follow `DEPLOYMENT_CHECKLIST.md` for production server setup
   - Use `main` branch for production-ready code
   - Test promotion workflow from development to production

3. **Configure Monitoring**
   - Set up Railway monitoring alerts
   - Configure log retention
   - Set up backup strategy for development database