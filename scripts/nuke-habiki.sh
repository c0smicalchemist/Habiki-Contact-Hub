#!/bin/bash
set -e
cd /opt/ibiki-sms
/opt/ibiki-sms/scripts/backup.sh || true
rm -rf dist/ node_modules/ .next/
git checkout production
git fetch origin production
git reset --hard origin/production
npm cache clean --force
npm ci
npm run build
if find dist/ -type f -exec grep -l -i "habiki\|social.*media\|scraping\|contact.*export" {} \; 2>/dev/null; then
  rm -rf dist/
  npm run build
fi
if grep -r -i "habiki\|social.*media\|scraping\|contact.*export" . --exclude-dir=node_modules --exclude-dir=dist 2>/dev/null; then
  echo "source-not-clean"
  exit 1
fi
pm2 restart ibiki-sms
pm2 save
echo "done"

