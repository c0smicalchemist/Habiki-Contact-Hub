#!/bin/bash
set -e
cd /opt/ibiki-sms
echo "source:" && if grep -r -i "habiki\|social.*media\|scraping\|contact.*export" . --exclude-dir=node_modules --exclude-dir=dist --exclude="*.log" 2>/dev/null; then echo "found"; else echo "clean"; fi
echo "dist:" && if find dist/ -type f -exec grep -l -i "habiki\|social.*media\|scraping\|contact.*export" {} \; 2>/dev/null; then echo "found"; else echo "clean"; fi
if [ -f "client/src/App.tsx" ]; then if grep -i "social\|scraping\|habiki" client/src/App.tsx; then echo "routes-found"; else echo "routes-clean"; fi; fi
if [ -f "client/src/pages/ClientDashboard.tsx" ]; then if grep -i "social\|scraping\|habiki" client/src/pages/ClientDashboard.tsx; then echo "tiles-found"; else echo "tiles-clean"; fi; fi
pm2 status ibiki-sms || true
curl -s http://localhost:5000/api/health | grep -o '"status":"[^"]*"' || true

