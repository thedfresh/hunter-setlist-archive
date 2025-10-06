#!/bin/bash
set -e

echo "Dumping local database..."
pg_dump -U dfresh -d hunter_archive_dev --data-only --no-owner --no-acl > /tmp/hunter-dump.sql

echo "Uploading database to server..."
scp /tmp/hunter-dump.sql root@134.199.227.86:/root/hunter-dump.sql

echo "Pushing code to GitHub (triggers deployment)..."
git push origin main

echo "Deployment initiated! Check GitHub Actions for progress."
rm /tmp/hunter-dump.sql