# Railway Deployment Guide

## Setup
1. Install Railway CLI:
```bash
npm install -g @railway/cli
```

2. Login and deploy:
```bash
railway login
railway init
railway up
```

## railway.json configuration
{
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "Dockerfile"
  },
  "deploy": {
    "startCommand": "node server.js",
    "healthcheckPath": "/api/health",
    "restartPolicyType": "ON_FAILURE"
  }
}

## Environment Variables (set in Railway dashboard)
- NODE_ENV=production
- PORT=3000

## Automatic HTTPS and custom domain included
## Built-in monitoring and logs