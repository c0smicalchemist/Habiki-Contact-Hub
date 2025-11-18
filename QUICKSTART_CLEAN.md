# Ibiki SMS - Quick Clean Deployment (3 Steps)

## 🚀 Fast Track Deployment

For experienced users who want to deploy quickly.

---

## **STEP 1: Upload to Server**

```bash
# From your computer (with project folder)
scp -r ibiki-sms root@151.243.109.79:/root/
```

---

## **STEP 2: SSH and Deploy**

```bash
# Connect to server
ssh root@151.243.109.79

# Navigate to folder
cd /root/ibiki-sms

# Make script executable
chmod +x deploy.sh

# Deploy (default: port 3100)
sudo ./deploy.sh
```

**Or with custom settings:**
```bash
export APP_PORT=3100
export DOMAIN=sms.yourdomain.com
sudo ./deploy.sh
```

---

## **STEP 3: Verify**

```bash
# Check status
pm2 list

# Test
curl http://localhost:3100

# View in browser
http://151.243.109.79:3100
```

---

## **✅ Done!**

- Create admin account at signup page
- Configure ExtremeSMS in Admin Dashboard
- Optional: Set up SSL with `sudo certbot --nginx -d sms.yourdomain.com`

---

## **Useful Commands**

```bash
pm2 logs ibiki-sms      # View logs
pm2 restart ibiki-sms   # Restart
pm2 monit               # Monitor
```

---

**For detailed instructions, see:** `CLEAN_DEPLOYMENT.md`
