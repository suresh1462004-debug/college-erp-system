# 🚀 College ERP - Deployment Guide

## Project Structure
```
college-erp/
├── server.js          # Main entry point
├── vercel.json        # Vercel deployment config
├── package.json       # Dependencies
├── .env.example       # Environment variables template
├── config/db.js       # MongoDB connection
├── models/            # Mongoose models
├── routes/            # API routes
├── middleware/        # Auth middleware
├── public/            # Frontend static files
│   ├── index.html
│   ├── styles.css
│   └── app.js
└── scripts/
    └── createAdmin.js # Initial admin setup
```

---

## STEP 1: Set Up MongoDB Atlas (Free Database)

1. Go to https://www.mongodb.com/atlas
2. Create a free account → Click **"Build a Database"**
3. Choose **FREE (M0 Shared)** tier
4. Select a cloud provider & region (closest to you)
5. Set username & password → **Save these!**
6. In **"Network Access"** → Add IP → `0.0.0.0/0` (allow all for Vercel)
7. Click **"Connect"** → **"Drivers"** → Copy the connection string:
   ```
   mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/college_erp?retryWrites=true&w=majority
   ```
8. Replace `<password>` with your actual password

---

## STEP 2: Push to GitHub

```bash
# 1. Create a new repo on github.com (name: college-erp)
# 2. In this project folder, run:

git init
git add .
git commit -m "Initial commit - College ERP System"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/college-erp.git
git push -u origin main
```

---

## STEP 3: Deploy to Vercel

### Option A: Via Vercel Dashboard (Easiest)
1. Go to https://vercel.com → Sign in with GitHub
2. Click **"Add New Project"**
3. Import your **college-erp** GitHub repo
4. In **"Environment Variables"** section, add these:

| Variable Name | Value |
|---|---|
| `MONGODB_URI` | `mongodb+srv://user:pass@cluster0.xxx.mongodb.net/college_erp?retryWrites=true&w=majority` |
| `JWT_SECRET` | `myCollegeERPsecretKey2024superLong!@#$` |
| `JWT_EXPIRE` | `7d` |
| `NODE_ENV` | `production` |

5. Click **"Deploy"** → Wait 2-3 minutes
6. Your app is live at: `https://college-erp-xxxxx.vercel.app`

### Option B: Via Vercel CLI
```bash
npm install -g vercel
vercel login
vercel --prod
# Answer prompts: link to existing project? No → Create new
# Set env variables when prompted
```

---

## STEP 4: Create First Admin Account

After deployment, run this **once** to create your admin login:

```bash
# Clone your repo locally, set up .env, then run:
cp .env.example .env
# Edit .env with your MongoDB URI
npm install
node scripts/createAdmin.js
```

**Default credentials created:**
- Email: `admin@college.com`
- Password: `Admin@123`
- ⚠️ Change these after first login!

---

## STEP 5: Verify Deployment

Visit these URLs after deploying:
- `https://your-app.vercel.app` → Frontend login page
- `https://your-app.vercel.app/api/health` → Should return `{"success":true}`
- `https://your-app.vercel.app/api/auth/login` → POST endpoint

---

## Environment Variables Reference

```env
# Required
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/college_erp
JWT_SECRET=minimum_32_character_random_string_here_very_secret
JWT_EXPIRE=7d
NODE_ENV=production

# Optional
PORT=5000
CLIENT_URL=https://your-app.vercel.app
```

**Generate a secure JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Alternative: Deploy Backend on Railway + Frontend on Vercel

If you want separate frontend/backend:

### Backend on Railway:
1. Go to https://railway.app
2. "New Project" → Deploy from GitHub → Select repo
3. Add environment variables
4. Railway auto-detects Node.js and runs `npm start`

### Frontend update for separate deployment:
In `public/app.js`, update:
```js
const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000/api' 
  : 'https://your-railway-backend.railway.app/api';  // ← Your Railway URL
```

---

## Troubleshooting

| Issue | Fix |
|---|---|
| "MongoDB connection failed" | Check MONGODB_URI and whitelist `0.0.0.0/0` in Atlas |
| "Cannot GET /" | Check vercel.json exists and is correct |
| Login not working | Check JWT_SECRET is set in Vercel env vars |
| API 404 errors | Check routes in vercel.json match `/api/*` |
| "Module not found" | Run `npm install` locally, check package.json |

