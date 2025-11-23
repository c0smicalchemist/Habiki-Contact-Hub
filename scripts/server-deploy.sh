#!/usr/bin/env bash
set -e
PACKAGE_PATH="$1"
APP_DIR="/opt/ibiki-sms"
mkdir -p "$APP_DIR"
tar -xzf "$PACKAGE_PATH" -C "$APP_DIR"
cd "$APP_DIR"
npm ci --omit=dev
pm2 delete ibiki-sms || true
pm2 start dist/index.js --name ibiki-sms
pm2 save

