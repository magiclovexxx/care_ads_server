#!/bin/bash
git stash
git pull origin master
npm install
pm2 start shopee.js --watch
pm2 save