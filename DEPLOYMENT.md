# Deployment Guide - Finance Tracker

This guide will walk you through deploying the Finance Tracker application to production using free hosting services.

## Overview

- **Frontend**: Vercel (Free tier)
- **Backend**: Render or Railway (Free tier)
- **Database**: MongoDB Atlas (Free M0 tier)

## Prerequisites

- GitHub account
- MongoDB Atlas account
- Vercel account
- Render or Railway account

## Step 1: Setup MongoDB Atlas

1. **Create Account**

   - Go to https://www.mongodb.com/cloud/atlas
   - Sign up for a free account

2. **Create Cluster**

   - Click "Build a Database"
   - Choose "Shared" (Free M0)
   - Select a cloud provider and region (choose closest to your users)
   - Name your cluster (e.g., "finance-tracker")
   - Click "Create"

3. **Create Database User**

   - Go to "Database Access" in sidebar
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Create username and password (save these!)
   - Set role to "Read and write to any database"
   - Click "Add User"

4. **Configure Network Access**

   - Go to "Network Access" in sidebar
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - Click "Confirm"
   - **Note**: For production, restrict to your backend server's IP

5. **Get Connection String**
   - Go to "Database" in sidebar
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `myFirstDatabase` with `finance-tracker`
   - Save this for later

## Step 2: Deploy Backend to Render

### Option A: Render (Recommended)

1. **Create Account**

   - Go to https://render.com
   - Sign up with GitHub

2. **Create Web Service**

   - Click "New +"
   - Select "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name**: finance-tracker-api
     - **Region**: Choose closest to your users
     - **Branch**: main
     - **Root Directory**: backend
     - **Runtime**: Node
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
     - **Plan**: Free

3. **Add Environment Variables**
   Click "Advanced" → "Add Environment Variable" for each:

   ```
   PORT=4000
   NODE_ENV=production
   MONGO_URI=<your-mongodb-connection-string>
   JWT_SECRET=<generate-strong-random-string-32+chars>
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=<your-email>
   SMTP_PASS=<your-app-password>
   FROM_EMAIL=<your-email>
   FRONTEND_URL=<will-add-after-vercel-deployment>
   ```

   **Generate JWT_SECRET**:

   ```bash
   # Run this in terminal to generate a secure secret:
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (5-10 minutes)
   - Copy the service URL (e.g., https://finance-tracker-api.onrender.com)
   - Save this URL for frontend configuration

### Option B: Railway (Alternative)

1. **Create Account**

   - Go to https://railway.app
   - Sign up with GitHub

2. **Create New Project**

   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Connect your repository
   - Select the repository

3. **Configure Service**

   - Click on the service
   - Go to "Settings"
   - Set **Root Directory**: backend
   - Set **Build Command**: npm install
   - Set **Start Command**: npm start

4. **Add Environment Variables**

   - Go to "Variables" tab
   - Add all environment variables from above

5. **Generate Domain**
   - Go to "Settings"
   - Click "Generate Domain"
   - Copy the domain URL

## Step 3: Deploy Frontend to Vercel

1. **Create Account**

   - Go to https://vercel.com
   - Sign up with GitHub

2. **Import Project**

   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - Configure:
     - **Framework Preset**: Vite
     - **Root Directory**: frontend
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`

3. **Add Environment Variables**

   - Click "Environment Variables"
   - Add:
     ```
     VITE_API_URL=<your-render-or-railway-url>/api
     ```
   - Example: `https://finance-tracker-api.onrender.com/api`

4. **Deploy**
   - Click "Deploy"
   - Wait for deployment (2-5 minutes)
   - Copy your Vercel URL (e.g., https://finance-tracker.vercel.app)

## Step 4: Update Backend with Frontend URL

1. **Go back to Render/Railway**
2. **Update Environment Variables**
   - Add or update `FRONTEND_URL` with your Vercel URL
   - Save changes
   - Backend will automatically redeploy

## Step 5: Test the Deployment

1. **Open Frontend URL**

   - Navigate to your Vercel URL
   - You should see the login page

2. **Test Signup**

   - Create a new account
   - Verify you can login

3. **Test Features**

   - Add a borrower
   - Mark a collection
   - Check dashboard statistics

4. **Test Email Notifications** (if configured)
   - Wait for scheduled time (9 AM) or
   - Manually trigger in backend code for testing

## Step 6: Configure Custom Domain (Optional)

### Vercel (Frontend)

1. Go to Project Settings → Domains
2. Add your domain
3. Update DNS records as instructed
4. SSL will be automatically configured

### Render (Backend)

1. Go to Settings → Custom Domain
2. Add your domain
3. Update DNS records
4. SSL will be automatically configured

## Monitoring and Maintenance

### Render

- **Logs**: Dashboard → Logs tab
- **Free tier**: Service may sleep after inactivity
- **Wake up**: First request may take 30-60 seconds

### Vercel

- **Analytics**: Built-in analytics available
- **Logs**: Deployments → Function logs

### MongoDB Atlas

- **Monitoring**: Metrics tab shows usage
- **Alerts**: Set up alerts for storage/connections
- **Free tier**: 512 MB storage

## Environment Variables Checklist

### Backend (.env)

- [ ] PORT=4000
- [ ] NODE_ENV=production
- [ ] MONGO_URI (MongoDB connection string)
- [ ] JWT_SECRET (32+ character random string)
- [ ] SMTP_HOST (optional)
- [ ] SMTP_PORT (optional)
- [ ] SMTP_USER (optional)
- [ ] SMTP_PASS (optional)
- [ ] FROM_EMAIL (optional)
- [ ] FRONTEND_URL (Vercel URL)

### Frontend (.env)

- [ ] VITE_API_URL (Render/Railway API URL + /api)

## Common Issues

### Backend 503 Error (Render Free Tier)

- **Cause**: Service goes to sleep after 15 minutes of inactivity
- **Solution**: First request wakes it up (wait 30-60 seconds)
- **Prevention**: Upgrade to paid plan or use a service like UptimeRobot to ping every 14 minutes

### CORS Errors

- **Cause**: Frontend URL not in CORS whitelist
- **Solution**: Verify FRONTEND_URL in backend environment variables
- **Check**: Ensure no trailing slash in URLs

### MongoDB Connection Error

- **Cause**: Wrong connection string or IP not whitelisted
- **Solution**:
  - Verify connection string format
  - Check Network Access in MongoDB Atlas
  - Ensure password has no special characters or encode them

### Email Not Sending

- **Cause**: Wrong SMTP credentials or app password not generated
- **Solution**:
  - Use Gmail app password (not regular password)
  - Enable 2FA first
  - Generate app password from Google Account settings

### Build Fails on Vercel

- **Cause**: Wrong build command or directory
- **Solution**:
  - Verify Root Directory is `frontend`
  - Check Build Command is `npm run build`
  - Ensure all dependencies are in package.json

## Security Best Practices

1. **JWT Secret**: Use a strong, random 32+ character string
2. **MongoDB**: Restrict IP access to backend server only
3. **Environment Variables**: Never commit .env files
4. **HTTPS**: Ensure both frontend and backend use HTTPS
5. **CORS**: Only allow your frontend domain
6. **Rate Limiting**: Consider adding rate limiting in production

## Backup Strategy

1. **MongoDB Atlas**

   - Automatic backups available (paid plans)
   - Manual export via `mongodump`

   ```bash
   mongodump --uri="<your-connection-string>"
   ```

2. **Code**
   - Keep GitHub repository updated
   - Tag releases
   - Document major changes

## Updating the Application

1. **Push to GitHub**

   ```bash
   git add .
   git commit -m "Your update message"
   git push origin main
   ```

2. **Automatic Deployment**

   - Vercel: Automatically deploys on push
   - Render: Automatically deploys on push
   - Railway: Automatically deploys on push

3. **Manual Deployment**
   - Vercel: Dashboard → Deployments → Redeploy
   - Render: Dashboard → Manual Deploy → Deploy latest commit

## Cost Estimates

### Free Tier Limits

**MongoDB Atlas (M0)**

- Storage: 512 MB
- Shared RAM
- No backup/restore
- Suitable for: ~1000-5000 borrowers

**Render Free**

- 750 hours/month
- Sleeps after 15 min inactivity
- 100 GB bandwidth/month

**Railway Free**

- $5 credit/month
- No sleep
- Limited to credit usage

**Vercel Free**

- 100 GB bandwidth/month
- Unlimited deployments
- 100 deployments/day

### When to Upgrade

Consider paid plans when:

- Database > 500 MB
- > 1000 daily active users
- Need 24/7 uptime (no sleep)
- Need backups/restore
- Need support

## Support and Resources

- **Render Docs**: https://render.com/docs
- **Railway Docs**: https://docs.railway.app
- **Vercel Docs**: https://vercel.com/docs
- **MongoDB Docs**: https://docs.mongodb.com

## Post-Deployment Checklist

- [ ] Frontend loads correctly
- [ ] Can create account
- [ ] Can login
- [ ] Can add borrower
- [ ] Can edit borrower
- [ ] Can delete borrower
- [ ] Can mark collection
- [ ] Dashboard shows statistics
- [ ] Collections page works
- [ ] Email reminders working (optional)
- [ ] Mobile responsive
- [ ] No console errors
- [ ] HTTPS enabled
- [ ] Custom domain configured (optional)

---

Congratulations! Your Finance Tracker is now live and ready to use! 🎉
