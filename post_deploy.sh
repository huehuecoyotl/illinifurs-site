#!/bin/bash

cd /apps/site/source

git remote update
if !(git status -uno | grep -q "Your branch is up to date with 'origin/main'.")
then
    git pull
fi

if !(git diff --quiet HEAD^.. -- ./package.json)
then
    npm install
fi

mkdir -p ./public/html/
cp /apps/secrets/*.html ./public/html/

if !(git diff --quiet HEAD^.. -- ./markdown/ && git diff --quiet HEAD^.. -- ./scripts/page_generator.rb)
then
    ./scripts/page_generator.rb
fi

mkdir -p ./public/txt/
cp ./misc/coyotes.txt ./public/txt/
date --rfc-2822 >> ./public/txt/coyotes.txt

pm2 startOrRestart ecosystem.config.js

cd -
