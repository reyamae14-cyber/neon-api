# 🚀 Deployment Options Guide

This project can be deployed to multiple platforms. Choose the one that works best for you.

---

## 📦 Option 1: Vercel (Recommended)

**Best for:** Next.js apps, automatic deployments, edge functions

### Steps:
1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "Import Project"
4. Select your GitHub repository
5. Add environment variable:
   - `TMDB_API_KEY` = your TMDB API key
6. Click "Deploy"

**✅ Done!** Your API will be live in ~2 minutes.

---

## 🌐 Option 2: Netlify

**Best for:** Alternative to Vercel, great free tier

### Steps:
1. Push your code to GitHub
2. Go to [netlify.com](https://netlify.com)
3. Click "Add new site" → "Import an existing project"
4. Connect to GitHub and select your repository
5. Build settings (auto-detected from netlify.toml):
   - Build command: `npm run build`
   - Publish directory: `.next`
6. Add environment variable:
   - `TMDB_API_KEY` = your TMDB API key
7. Click "Deploy site"

**✅ Done!** Your API will be live in ~3 minutes.

---

## 🚂 Option 3: Railway

**Best for:** Full-stack apps, databases, background jobs

### Steps:
1. Push your code to GitHub
2. Go to [railway.app](https://railway.app)
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Add environment variable:
   - `TMDB_API_KEY` = your TMDB API key
6. Railway will auto-detect Next.js and deploy

**✅ Done!** Your API will be live in ~3 minutes.

---

## 🎨 Option 4: Render

**Best for:** Free tier with persistent storage

### Steps:
1. Push your code to GitHub
2. Go to [render.com](https://render.com)
3. Click "New" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
6. Add environment variable:
   - `TMDB_API_KEY` = your TMDB API key
7. Click "Create Web Service"

**✅ Done!** Your API will be live in ~5 minutes.

---

## 🐳 Option 5: Fly.io

**Best for:** Global edge deployment, Docker support

### Steps:
1. Install Fly CLI: `curl -L https://fly.io/install.sh | sh`
2. Login: `fly auth login`
3. In your project directory: `fly launch`
4. Follow the prompts (it will detect Next.js)
5. Set environment variable:
   \`\`\`bash
   fly secrets set TMDB_API_KEY=your_api_key_here
   \`\`\`
6. Deploy: `fly deploy`

**✅ Done!** Your API will be live globally.

---

## 🔧 Environment Variables Required

All platforms need this environment variable:

\`\`\`
TMDB_API_KEY=your_tmdb_api_key_here
\`\`\`

Get your TMDB API key from: https://www.themoviedb.org/settings/api

---

## 🌍 Whitelisted Domains

These domains are pre-configured to access your API:
- ✅ `https://zetflix-tv.vercel.app`
- ✅ `https://samxerz1.vercel.app`
- ✅ All localhost addresses (for development)

To add more domains, edit `middleware.ts` and add to `ALLOWED_ORIGINS`.

---

## 📊 Platform Comparison

| Platform | Free Tier | Build Time | Edge Network | Best For |
|----------|-----------|------------|--------------|----------|
| **Vercel** | ✅ Generous | ⚡ Fast | ✅ Global | Next.js apps |
| **Netlify** | ✅ Good | ⚡ Fast | ✅ Global | Static + SSR |
| **Railway** | ✅ $5 credit | 🔄 Medium | ❌ Single region | Full-stack |
| **Render** | ✅ Limited | 🐌 Slower | ❌ Single region | Simple apps |
| **Fly.io** | ✅ Good | 🔄 Medium | ✅ Global | Docker apps |

---

## 🆘 Troubleshooting

### Vercel: "Multiple regions" error
- ✅ **Fixed!** The `vercel.json` no longer has regions config
- If you still see this, delete the project and redeploy

### Netlify: Build fails
- Make sure `@netlify/plugin-nextjs` is installed
- Check that Node version is 18 or higher

### Railway/Render: Slow builds
- These platforms compile on deploy, so first build takes longer
- Subsequent builds are faster with caching

### Any platform: API not working
- Check environment variables are set correctly
- Verify TMDB_API_KEY is valid
- Check deployment logs for errors

---

## 🎯 Recommended Choice

**For this project, we recommend:**
1. **Vercel** (1st choice) - Best Next.js support, fastest
2. **Netlify** (2nd choice) - Great alternative, similar features
3. **Railway** (3rd choice) - If you need more backend features

All three work great with this project! 🚀
