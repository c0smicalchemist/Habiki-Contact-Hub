#!/usr/bin/env bash
set -e
rm -rf dist
npm ci
npm run build
mkdir -p release
tar -czf release/ibiki-sms-$(date +%Y%m%d%H%M%S).tar.gz dist package.json package-lock.json deploy.sh .env.example VERSION

