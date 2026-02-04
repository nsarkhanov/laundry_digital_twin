# Render Deployment Guide - Laundry Digital Twin

## Pre-requisites
✅ Render account  
✅ Code in GitLab (Render supports GitLab directly!)

---

## Step 1: Push Changes to GitLab

First, commit and push the new files:
```bash
cd /home/nurlansarkhanov/Desktop/code/revelton-projects/laundry_digital_twin
git add .
git commit -m "Add Render deployment configuration"
git push origin main
```

---

## Step 2: Deploy Backend (Web Service)

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your **GitLab** account and select `laundry_digital_twin` repository
4. Configure:

| Setting | Value |
|---------|-------|
| **Name** | `laundry-backend` |
| **Root Directory** | `backend` |
| **Runtime** | Python 3 |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `uvicorn server:app --host 0.0.0.0 --port $PORT` |

5. **Add Persistent Disk** (important for SQLite!):
   - Click **"Add Disk"**
   - **Name**: `laundry-data`
   - **Mount Path**: `/data`
   - **Size**: 1 GB

6. **Add Environment Variables**:
   - `DATABASE_PATH` = `/data/laundry.db`
   - `ALLOWED_ORIGINS` = *(leave empty for now, add after frontend deploy)*

7. Click **"Create Web Service"**

8. **Copy the URL** (e.g., `https://laundry-backend-xxxx.onrender.com`)

---

## Step 3: Deploy Frontend (Static Site)

1. Click **"New +"** → **"Static Site"**
2. Connect the same GitLab repository
3. Configure:

| Setting | Value |
|---------|-------|
| **Name** | `laundry-frontend` |
| **Root Directory** | `frontend` |
| **Build Command** | `yarn install && yarn build` |
| **Publish Directory** | `build` |

4. **Add Environment Variable**:
   - `REACT_APP_BACKEND_URL` = `https://laundry-backend-xxxx.onrender.com` *(use your actual backend URL from Step 2)*

5. Click **"Create Static Site"**

---

## Step 4: Update Backend CORS

1. Go back to your **Backend** service settings
2. Update environment variable:
   - `ALLOWED_ORIGINS` = `https://laundry-frontend-xxxx.onrender.com` *(your actual frontend URL)*
3. Click **"Save Changes"** (backend will redeploy)

---

## Step 5: Test Your Deployment

1. Open your frontend URL in browser
2. Verify the app loads
3. Test calculating costs
4. Refresh page to confirm data persistence

---

## Notes

⚠️ **First deploy takes 5-10 minutes** - be patient!

⚠️ **Free tier**: Services spin down after 15 min of inactivity. First request after spin-down takes ~30 seconds.

💰 **Persistent disk requires paid plan** (~$7/month for 1GB disk)
