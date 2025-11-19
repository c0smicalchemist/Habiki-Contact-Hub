=============================================================================
IBIKI SMS v14.1 - DATABASE FIX + STATUS ENDPOINT
=============================================================================

📦 Version: 14.1
🎯 Critical Fixes:
   ✅ Admin dashboard now shows clients
   ✅ Message status endpoint for dashboards
⚡ Deploy Time: 5 minutes

=============================================================================
🐛 WHAT THIS FIXES
=============================================================================

PROBLEM 1: Admin Dashboard Empty
- Created users but admin dashboard shows empty table
- Can't see clients to allocate credits
- "Failed to fetch clients" error

ROOT CAUSE: Database schema out of sync
FIX: ✅ Database schema synced with npm run db:push
     ✅ Missing "sender_phone_number" column added
     ✅ Admin dashboard now loads clients correctly

PROBLEM 2: Missing Status Endpoint
- No way to check message delivery status from dashboards
- API endpoint only worked with API keys, not dashboards

ROOT CAUSE: Missing JWT-authenticated endpoint
FIX: ✅ New endpoint: GET /api/dashboard/sms/status/{messageId}
     ✅ Works for both admin and client dashboards
     ✅ Fetches latest status from ExtremeSMS
     ✅ Updates local database automatically
     ✅ Falls back to cached status if ExtremeSMS unavailable

=============================================================================
🆕 NEW ENDPOINT
=============================================================================

GET /api/dashboard/sms/status/{messageId}
----------------------------------------
Purpose: Check delivery status of a sent message from dashboard
Auth: JWT token (Bearer token from login)
Access: Admins can check any message, clients can check their own

Request:
  GET /api/dashboard/sms/status/MBT1aX5M6xc15h-6P.00.wbev
  Authorization: Bearer <your_jwt_token>

Response:
  {
    "success": true,
    "messageId": "MBT1aX5M6xc15h-6P.00.wbev",
    "status": "delivered",
    "statusDescription": "delivered"
  }

Possible Statuses:
- "queued" - Message queued for sending
- "sent" - Message sent to carrier
- "delivered" - Message delivered to recipient
- "failed" - Message failed to send

Use Cases:
✅ Client dashboard: Check status of their sent messages
✅ Admin dashboard: Monitor all message deliveries
✅ Your clients: Passthrough status check to their systems

=============================================================================
⚡ QUICK DEPLOYMENT
=============================================================================

1️⃣ UPLOAD TO SERVER:
   scp ibiki-sms-v14.1.tar.gz root@151.243.109.79:/root/

2️⃣ SSH IN:
   ssh root@151.243.109.79

3️⃣ EXTRACT:
   cd /root
   tar -xzf ibiki-sms-v14.1.tar.gz
   cd ibiki-sms-v14.1-deploy

4️⃣ DEPLOY:
   chmod +x deploy-v14.1.sh
   ./deploy-v14.1.sh

5️⃣ VERIFY:
   - Open http://151.243.109.79
   - Login as admin → Go to Clients tab
   - You should see registered clients!
   - Test status endpoint with a messageId

=============================================================================
✅ WHAT THE DEPLOYMENT DOES
=============================================================================

1. Stops all PM2 processes cleanly
2. Clears port 5000 conflicts
3. Copies updated code to /root/ibiki-sms
4. Creates .env with DATABASE_URL
5. Installs dependencies
6. Builds application
7. **RUNS DATABASE MIGRATION (THE FIX!)** ← Syncs schema
8. Starts PM2 with correct name
9. Verifies everything is running

=============================================================================
🎯 VERIFY IT WORKED
=============================================================================

After deployment, check these:

✅ PM2 Status:
   pm2 status
   Should show: ibiki-sms | online

✅ Logs:
   pm2 logs ibiki-sms --lines 30
   Should show: "serving on port 5000"
   Should NOT show: errors about "sender_phone_number"

✅ Admin Dashboard:
   1. Open http://151.243.109.79
   2. Login with admin account
   3. Click "Admin Dashboard"
   4. Click "Clients" tab
   5. YOU SHOULD NOW SEE:
      • test@example.com
      • Credits: $50.00
      • Status: active
      • "Add Credits" button

✅ Status Endpoint:
   Test the new status endpoint:
   
   TOKEN=$(Get JWT token from browser devtools)
   curl http://151.243.109.79/api/dashboard/sms/status/YOUR_MESSAGE_ID \
     -H "Authorization: Bearer $TOKEN"
   
   Should return status information

=============================================================================
📊 YOUR DATA IS SAFE
=============================================================================

All existing data preserved:
✅ Users (admin and clients)
✅ Credits balances
✅ API keys
✅ Message logs
✅ All configuration

This deployment:
✅ Adds missing database column
✅ Adds new status endpoint
✅ Fixes API endpoint crashes
✅ Updates application code

NOTHING is deleted or lost!

=============================================================================
🎉 WHAT YOU CAN DO NOW
=============================================================================

ADMIN:
✅ See all registered clients in dashboard
✅ Allocate credits to any client
✅ View client balances and activity
✅ Check message delivery status for any client
✅ Assign phone numbers to clients
✅ Monitor all system activity

CLIENTS:
✅ Login to their dashboard
✅ See their credit balance
✅ See their per-SMS rate
✅ Send SMS messages
✅ Check delivery status of their messages
✅ View message history

YOUR CLIENTS (External API users):
✅ Check message status via API
✅ GET /api/v2/sms/status/{messageId} with API key
✅ Integrate status checks into their systems
✅ Track delivery rates programmatically

=============================================================================
🔧 TROUBLESHOOTING
=============================================================================

Problem: Still not seeing clients
Fix:
   cd /root/ibiki-sms
   npm run db:push --force
   pm2 restart ibiki-sms

Problem: Status endpoint returns 404
Fix:
   # Make sure you're using the dashboard endpoint
   GET /api/dashboard/sms/status/{messageId}
   # NOT the API endpoint: /api/v2/sms/status/{messageId}

Problem: Port 5000 in use
Fix:
   lsof -ti:5000 | xargs kill -9
   ./deploy-v14.1.sh

Problem: Database connection error
Fix:
   # Check PostgreSQL is running
   systemctl status postgresql
   
   # Check .env has correct DATABASE_URL
   cat /root/ibiki-sms/.env

=============================================================================
📞 QUICK COMMANDS
=============================================================================

Check status:       pm2 status
View logs:          pm2 logs ibiki-sms --lines 50
Restart:            pm2 restart ibiki-sms
Run migration:      cd /root/ibiki-sms && npm run db:push
Check database:     PGPASSWORD=Cosmic4382 psql -U ibiki_user -d ibiki_sms

Test status endpoint:
   # Get a JWT token from browser devtools after login
   TOKEN="your_jwt_token_here"
   MESSAGE_ID="your_message_id_here"
   
   curl http://localhost:5000/api/dashboard/sms/status/$MESSAGE_ID \
     -H "Authorization: Bearer $TOKEN"

=============================================================================
💡 TECHNICAL DETAILS
=============================================================================

Database Changes:
- Added: message_logs.sender_phone_number (text, nullable)
- Purpose: Track which phone number sent each message
- Used for: 2-way SMS routing and conversation tracking

New Endpoint:
- Route: GET /api/dashboard/sms/status/:messageId
- Auth: JWT (Bearer token)
- Access Control:
  * Admins: Can check any message
  * Clients: Can only check their own messages
- Behavior:
  1. Verifies message exists in database
  2. Checks user has permission
  3. Fetches latest status from ExtremeSMS
  4. Updates local database with new status
  5. Falls back to cached status if ExtremeSMS fails
  6. Returns JSON response with status

Existing Endpoint (unchanged):
- Route: GET /api/v2/sms/status/:messageId
- Auth: API Key
- Purpose: For external clients using your API
- Access: Clients can only check their own messages

=============================================================================
