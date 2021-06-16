#!/bin/bash
git stash
git pull origin master
npm install
pm2 restart server
pm2 restart cron_check
