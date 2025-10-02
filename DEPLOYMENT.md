# 🚀 ZETFLIX Deployment Guide

Complete guide for deploying your secure, high-performance streaming platform to Vercel.

## 📋 Prerequisites

Before you begin, ensure you have:

- ✅ GitHub account
- ✅ Vercel account (free tier works perfectly)
- ✅ TMDB API key ([Get one here](https://www.themoviedb.org/settings/api))
- ✅ Git installed on your computer
- ✅ Node.js 18+ installed

## 🔑 Step 1: Get Your TMDB API Key

1. Go to [https://www.themoviedb.org/](https://www.themoviedb.org/)
2. Create an account or sign in
3. Navigate to Settings → API
4. Request an API key (select "Developer")
5. Fill out the form (use "Personal" or "Educational" for type)
6. Copy your API key - you'll need it later

## 📦 Step 2: Prepare Your Code

### Update Security Settings

**CRITICAL: Change the admin password!**

Edit `app/admin/whitelist/page.tsx`:

\`\`\`typescript
const ADMIN_PASSWORD = "your_super_secure_password_here" // Change this!
\`\`\`

### Update Allowed Domains

Edit `middleware.ts` and add your production domain:

\`\`\`typescript
const ALLOWED_ORIGINS = [
  "https://your-domain.vercel.app", // Add your Vercel domain
  "https://your-custom-domain.com", // Add custom domain if you have one
]
\`\`\`

## 🌐 Step 3: Push to GitHub

### Initialize Git Repository

\`\`\`bash
# Navigate to your project directory
cd zetflix

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit your changes
git commit -m "Initial commit - Ready for deployment"
\`\`\`

### Create GitHub Repository

1. Go to [github.com](https://github.com)
2. Click the "+" icon → "New repository"
3. Name it (e.g., "zetflix")
4. Don't initialize with README (you already have one)
5. Click "Create repository"

### Push Your Code

\`\`\`bash
# Add GitHub remote (replace with your repository URL)
git remote add origin https://github.com/YOUR_USERNAME/zetflix.git

# Set main branch
git branch -M main

# Push to GitHub
git push -u origin main
\`\`\`

## ☁️ Step 4: Deploy to Vercel

### Method 1: Via Vercel Dashboard (Recommended)

1. **Go to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Sign in with GitHub

2. **Import Project**
   - Click "Add New..." → "Project"
   - Select your GitHub repository
   - Vercel will auto-detect Next.js

3. **Configure Project**
   - Project Name: `zetflix` (or your choice)
   - Framework Preset: Next.js (auto-detected)
   - Root Directory: `./`
   - Build Command: `next build` (auto-filled)
   - Output Directory: `.next` (auto-filled)

4. **Add Environment Variables**
   - Click "Environment Variables"
   - Add variable:
     - Name: `TMDB_API_KEY`
     - Value: `your_tmdb_api_key_here`
   - Apply to: Production, Preview, Development (check all)

5. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes for build to complete
   - Your site will be live at `https://your-project.vercel.app`

### Method 2: Via Vercel CLI

\`\`\`bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to preview
vercel

# Follow the prompts:
# ? Set up and deploy? Yes
# ? Which scope? [Select your account]
# ? Link to existing project? No
# ? What's your project's name? zetflix
# ? In which directory is your code located? ./
# ? Want to override the settings? No

# Add environment variable
vercel env add TMDB_API_KEY production

# Deploy to production
vercel --prod
\`\`\`

## 🔒 Step 5: Post-Deployment Security Setup

### 1. Update Middleware with Your Domain

After deployment, update `middleware.ts`:

\`\`\`typescript
const ALLOWED_ORIGINS = [
  "https://your-actual-domain.vercel.app", // Your real Vercel URL
]
\`\`\`

Commit and push:

\`\`\`bash
git add middleware.ts
git commit -m "Update allowed origins with production domain"
git push
\`\`\`

Vercel will automatically redeploy.

### 2. Configure Whitelist (Optional)

If you want to allow specific domains to embed your player:

1. Visit `https://your-domain.vercel.app/admin/whitelist`
2. Enter your admin password (the one you changed)
3. Add allowed domains:
   - `https://your-domain.vercel.app`
   - `http://localhost:3000` (for local testing)
   - Any other domains you want to allow
4. Click "Save Whitelist"
5. Update `middleware.ts` with the same domains

## ✅ Step 6: Verification Checklist

Test everything to ensure it's working:

### Basic Functionality
- [ ] Site loads at your Vercel URL
- [ ] Admin page (`/admin/whitelist`) is the landing page
- [ ] Can login to admin panel with your password
- [ ] TMDB API is working (no errors in console)

### Streaming Servers
- [ ] Zeticuz server loads and plays content
- [ ] Spectre server works
- [ ] Infested server works
- [ ] Invictuz server works
- [ ] SamXerz server works
- [ ] Icarus server works
- [ ] Orion server works
- [ ] Theseus server works

### Performance Features
- [ ] Server ping monitoring shows real-time latency
- [ ] Ping colors are correct (green < 100ms, yellow < 200ms, red > 200ms)
- [ ] Automatic proxy selection is working
- [ ] Page loads in under 3 seconds
- [ ] Server switching is smooth and fast

### Security Features
- [ ] Right-click is disabled on player pages
- [ ] F12 and DevTools shortcuts are blocked
- [ ] Server URLs are obfuscated in network tab
- [ ] Whitelist protection is working
- [ ] CORS headers are properly set

### UI/UX Features
- [ ] Neon effects are smooth (no glitches)
- [ ] Theme switching works correctly
- [ ] Settings button auto-hides after 5 seconds
- [ ] Mobile responsive design works
- [ ] All 8 themes load correctly

### Mobile Testing
- [ ] Test on iOS Safari
- [ ] Test on Chrome Mobile
- [ ] Touch gestures work (tap right edge for settings)
- [ ] Video playback works on mobile

## 🌍 Step 7: Custom Domain (Optional)

### Add Custom Domain to Vercel

1. Go to your project in Vercel dashboard
2. Click "Settings" → "Domains"
3. Add your custom domain (e.g., `zetflix.com`)
4. Follow Vercel's DNS configuration instructions
5. Wait for DNS propagation (can take up to 48 hours)

### Update Configuration

After adding custom domain, update:

1. **middleware.ts**
   \`\`\`typescript
   const ALLOWED_ORIGINS = [
     "https://zetflix.com",
     "https://www.zetflix.com",
   ]
   \`\`\`

2. **Whitelist** - Add your custom domain in admin panel

3. **Commit and push** - Vercel will auto-deploy

## 🚀 Performance Optimizations Included

Your deployment includes these optimizations out of the box:

### Global Speed & Connection
- ✅ Multi-region proxy network (US, Europe, Asia-Pacific)
- ✅ Automatic best-proxy selection based on user location
- ✅ DNS prefetching for all video servers
- ✅ Preconnect to critical domains
- ✅ Real-time server health monitoring
- ✅ Auto-fallback to fastest server
- ✅ Optimized for low-latency global connections
- ✅ Edge caching and compression
- ✅ 15-second ping cache for faster measurements

### Security & Privacy
- ✅ URL obfuscation (double Base64 + character rotation)
- ✅ Server sources hidden from dev tools
- ✅ Network requests obfuscated
- ✅ Ad blocking via sandbox iframes
- ✅ CSP headers prevent unauthorized embedding
- ✅ Whitelist system for domain control
- ✅ Anti-debugging protection (F12 detection)
- ✅ Right-click and keyboard shortcut blocking
- ✅ Middleware referrer checking
- ✅ HTTPS-only in production
- ✅ Strict security headers

### Visual & UX
- ✅ Smooth neon color transitions
- ✅ Hardware-accelerated animations
- ✅ Optimized color adjustment bars
- ✅ Responsive design for all devices
- ✅ Auto-hide settings button
- ✅ Touch-optimized for mobile

### Build Optimizations
- ✅ SWC minification
- ✅ CSS optimization
- ✅ Package import optimization
- ✅ Image optimization
- ✅ Static asset caching (1 year)
- ✅ API response caching (60 seconds)

## 🐛 Troubleshooting

### Build Errors

**Error: "TMDB_API_KEY is not defined"**

Solution:
1. Go to Vercel dashboard → Your Project → Settings → Environment Variables
2. Add `TMDB_API_KEY` with your API key
3. Redeploy the project

**Error: "Module not found"**

Solution:
\`\`\`bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
git add .
git commit -m "Fix dependencies"
git push
\`\`\`

**Error: "Build failed"**

Solution:
1. Check Vercel build logs for specific error
2. Ensure all files are committed to GitHub
3. Verify `next.config.mjs` is correct
4. Try deploying again

### Runtime Errors

**Videos not loading**

Possible causes:
- TMDB API key not set correctly
- Video servers blocked by your ISP/firewall
- CORS errors (check browser console)

Solutions:
- Verify API key in Vercel environment variables
- Try different servers from the menu
- Check browser console for specific errors
- Test with VPN if servers are blocked

**Admin page not accessible**

Solutions:
- Clear browser cache and cookies
- Verify you're using the correct password
- Check middleware configuration
- Try incognito/private browsing mode

**Slow loading times**

Solutions:
- Check your internet connection
- Verify proxy servers are working (check ping times)
- Try a different streaming server
- Clear browser cache
- Check Vercel analytics for performance issues

**High ping times (> 500ms)**

Solutions:
- Your ISP might be throttling connections
- Try using a VPN
- Select a different server manually
- Check if proxy rotation is working

**Server URLs visible in dev tools**

Solutions:
- Verify `lib/url-obfuscator.ts` is deployed
- Check that obfuscation is being applied
- Clear browser cache
- Redeploy the project

### Security Issues

**Right-click still works**

Solution:
- This is normal on localhost
- Check `isLocalhost` detection in player pages
- Verify it's disabled in production

**DevTools can still be opened**

Note: Anti-debugging features deter casual users but can't completely prevent determined users. This is expected behavior.

**Whitelist not working**

Solutions:
1. Verify domains are added in admin panel
2. Check `middleware.ts` has the same domains
3. Ensure domains include protocol (https://)
4. Redeploy after updating middleware

## 📊 Monitoring & Analytics

### Vercel Analytics

1. Go to your project in Vercel dashboard
2. Click "Analytics" tab
3. Monitor:
   - Page views
   - Load times
   - Error rates
   - Geographic distribution

### Performance Monitoring

Check these metrics regularly:
- **First Contentful Paint**: Should be < 1.5s
- **Time to Interactive**: Should be < 3s
- **Largest Contentful Paint**: Should be < 2.5s
- **Cumulative Layout Shift**: Should be < 0.1

### Error Monitoring

1. Check Vercel logs for errors
2. Monitor browser console in production
3. Set up error tracking (optional: Sentry, LogRocket)

## 🔄 Updating Your Deployment

### Push Updates

\`\`\`bash
# Make your changes
git add .
git commit -m "Description of changes"
git push

# Vercel will automatically deploy
\`\`\`

### Rollback to Previous Version

1. Go to Vercel dashboard → Your Project → Deployments
2. Find the working deployment
3. Click "..." → "Promote to Production"

### Update Environment Variables

1. Vercel dashboard → Settings → Environment Variables
2. Edit or add variables
3. Redeploy for changes to take effect

## 🎯 Production Best Practices

### Security
- ✅ Change default admin password
- ✅ Use strong, unique passwords
- ✅ Keep whitelist updated
- ✅ Monitor access logs
- ✅ Update dependencies regularly
- ✅ Enable HTTPS only (Vercel does this automatically)

### Performance
- ✅ Monitor server ping times
- ✅ Check proxy performance weekly
- ✅ Review Vercel analytics
- ✅ Optimize images if adding custom content
- ✅ Keep dependencies updated

### Maintenance
- ✅ Weekly: Check server availability
- ✅ Monthly: Update dependencies (`npm update`)
- ✅ Quarterly: Review security settings
- ✅ Annually: Audit whitelist domains

## 📞 Support & Resources

### Documentation
- [Next.js Docs](https://nextjs.org/docs)
- [Vercel Docs](https://vercel.com/docs)
- [TMDB API Docs](https://developers.themoviedb.org/3)

### Common Issues
- Check README.md for detailed feature documentation
- Review code comments for implementation details
- Search GitHub issues for similar problems

### Getting Help
1. Check this deployment guide
2. Review troubleshooting section
3. Check Vercel build logs
4. Review browser console errors
5. Create GitHub issue with details

## 🎉 Success!

Your ZETFLIX platform is now live and ready to stream! 

**Your deployment includes:**
- 🌍 Global proxy network for fast streaming worldwide
- 🔒 Military-grade security with URL obfuscation
- ⚡ Real-time server monitoring and auto-failover
- 🎨 Beautiful neon UI with 8 themes
- 📱 Mobile-optimized responsive design
- 🛡️ Anti-debugging and embed protection
- 🚀 Optimized for maximum performance

**Next Steps:**
1. Share your URL with users
2. Monitor performance in Vercel dashboard
3. Add custom domain (optional)
4. Customize themes and colors
5. Add more allowed domains to whitelist

---

**Version**: 2.0.0  
**Last Updated**: January 2025  
**Status**: Production Ready ✅

**Made with ❤️ for the streaming community**
