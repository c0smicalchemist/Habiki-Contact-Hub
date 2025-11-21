# Railway Environment Variables Setup

This guide shows you how to automatically apply environment variables on every Railway deployment.

## 🎯 Quick Fix for Current Issue

**You need to add the `DATABASE_URL` variable to Railway:**

1. Go to your Railway project → **Variables** tab
2. Click **"Add"** button
3. Set **VARIABLE_NAME**: `DATABASE_URL`
4. Set **VALUE**: Click **"Add Reference"** → Select `DATABASE_URL` from your PostgreSQL service
5. Click **Save**

This will fix the current signup error immediately!

## 🔧 Automatic Environment Variable Methods

### Method 1: railway.json (Recommended)

The `railway.json` file in your project root automatically applies variables on deployment:

```json
{
  "environments": {
    "development": {
      "variables": {
        "JWT_SECRET": "your-jwt-secret",
        "SESSION_SECRET": "your-session-secret",
        "NODE_ENV": "development"
      }
    }
  }
}
```

**✅ Pros:**
- Automatically applied on every deployment
- Version controlled
- Environment-specific configurations
- No manual setup needed

**❌ Cons:**
- Secrets are visible in git (use for non-sensitive vars only)

### Method 2: Railway CLI Script

Use the `railway-deploy.sh` script to automatically set variables:

```bash
# Make executable
chmod +x railway-deploy.sh

# Deploy with automatic variable setup
./railway-deploy.sh
```

**✅ Pros:**
- Can use `.env.railway` file (not committed to git)
- Automated deployment process
- Handles sensitive variables securely

### Method 3: Railway Service Variables (Current)

Set variables manually in Railway dashboard - they persist across deployments.

## 🔐 Security Best Practices

### For Non-Sensitive Variables (railway.json):
- `NODE_ENV`
- `HOST`
- `LOG_LEVEL`
- Public API endpoints

### For Sensitive Variables (Railway UI or CLI):
- `JWT_SECRET`
- `SESSION_SECRET`
- `DATABASE_URL`
- `RESEND_API_KEY`
- `WEBHOOK_SECRET`

## 📋 Your Current Variables

Here are the variables you need to set:

```bash
# Security (set via Railway UI)
JWT_SECRET=ibiki_dev_jwt_2024_k9mX7pQ2vN8wR5tY3uE6sA1bC4dF7gH0jL9nM2pS5vX8zA1bC4dF7gH0
SESSION_SECRET=ibiki_dev_session_2024_R7tY9uI2oP5aS8dF1gH4jK7lZ0xC3vB6nM9qW2eR5tY8uI1oP4aS7dF0
WEBHOOK_SECRET=kP3mR9tY2wZ5bN8vX1jH4mC7qF0gL6sA

# Database (set via Railway UI - Add Reference)
DATABASE_URL=${DATABASE_URL}  # Reference to PostgreSQL service

# API Keys (set via Railway UI)
RESEND_API_KEY=re_AooycXq6_9pR5wQeDYceidFrJj4m6hqAy

# App Config (already in railway.json)
NODE_ENV=development
HOST=0.0.0.0
LOG_LEVEL=debug
```

## 🚀 Deployment Workflow

### Option A: Automatic (Recommended)
1. Update `railway.json` for non-sensitive variables
2. Set sensitive variables once in Railway UI
3. Push to git - Railway auto-deploys with all variables

### Option B: Script-Based
1. Update `.env.railway` file (not committed)
2. Run `./railway-deploy.sh`
3. Script sets variables and deploys

### Option C: Manual
1. Set all variables in Railway UI
2. Push to git for deployment

## 🔧 Troubleshooting

### DATABASE_URL Issues:
- Make sure PostgreSQL addon is connected
- Add `DATABASE_URL` as a **reference** to the PostgreSQL service
- Don't manually type the connection string

### Variables Not Applied:
- Check Railway deployment logs
- Verify `railway.json` syntax
- Ensure variables are set in correct environment (development/production)

### Build Failures:
- Check that all required variables are set
- Verify no typos in variable names
- Check Railway build logs for specific errors

## 📝 Files Created:

- `railway.json` - Automatic variable deployment
- `.env.railway` - Local variable template (not committed)
- `railway-deploy.sh` - Automated deployment script
- Updated `.gitignore` - Excludes sensitive files

## 🎯 Next Steps:

1. **Fix DATABASE_URL** (add as reference in Railway UI)
2. **Test deployment** - signup should work
3. **Verify all variables** are applied correctly
4. **Set up production environment** when ready

Your app should work perfectly once `DATABASE_URL` is added! 🚀