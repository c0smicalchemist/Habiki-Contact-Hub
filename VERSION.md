# Version History

## v11.2 (November 18, 2025)
**Privacy & Branding Update**

### Changes
- ✅ Removed all ExtremeSMS references from Webhook Setup tab
- ✅ Changed to generic "SMS provider" language throughout client-facing areas
- ✅ Updated API documentation to hide backend infrastructure
- ✅ Professional branding - clients only see Ibiki SMS

### Technical
- Admin backend configuration still references ExtremeSMS (appropriate for admin use)
- Webhook Setup tab now uses generic language suitable for sharing with clients
- All client-facing documentation is vendor-neutral

---

## v11.1 (November 18, 2025)
**Multiple Phone Numbers Support**

### Changes
- ✅ Upgraded from single phone number to unlimited phone numbers per client
- ✅ Array-based storage in database (assignedPhoneNumbers)
- ✅ Comma-separated input in admin UI
- ✅ Updated routing logic to check all assigned numbers

---

## v11.0 (November 18, 2025)
**2-Way SMS Launch**

### Initial Features
- ✅ Incoming SMS webhook endpoint
- ✅ Client dashboard inbox with auto-refresh
- ✅ Database schema for incoming messages
- ✅ Dual API access (JWT + API key)
- ✅ Webhook Setup tab in admin dashboard
