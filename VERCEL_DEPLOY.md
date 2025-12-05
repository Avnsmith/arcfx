# 🚀 Deploy to Vercel - Quick Guide

## Your Vercel Account
- **Account**: avins-projects-94a43281
- **Dashboard**: https://vercel.com/avins-projects-94a43281

## Deployment Steps

### Prerequisites
1. ✅ Code is ready in `/Users/vinh/ARC`
2. ✅ GitHub repository needs to be created (if not already)
3. ✅ Push code to GitHub

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Go to your Vercel Dashboard**:
   - Visit: https://vercel.com/avins-projects-94a43281
   - Or: https://vercel.com/dashboard

2. **Add New Project**:
   - Click **"Add New..."** button
   - Select **"Project"**
   - If prompted, authorize GitHub access

3. **Import Repository**:
   - Search for or select: **`arcfx`** (or your repository name)
   - Click **"Import"**

4. **Configure Project**:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (auto)
   - **Output Directory**: `.next` (auto)
   - **Install Command**: `npm install` (auto)

5. **Environment Variables** (Optional - for localhost, skip for now):
   - For testnet deployment, add:
     - `NEXT_PUBLIC_USDC_ADDRESS`
     - `NEXT_PUBLIC_SWAP_BRIDGE_ADDRESS`
     - `NEXT_PUBLIC_LOCAL_CHAIN_ID`
     - `NEXT_PUBLIC_LOCAL_RPC`
   - **Note**: Skip for now if just deploying the UI

6. **Deploy**:
   - Click **"Deploy"**
   - Wait 2-3 minutes
   - Your app will be live! 🎉

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```
   - Choose your preferred login method

3. **Deploy from Project Directory**:
   ```bash
   cd /Users/vinh/ARC
   vercel
   ```

4. **Follow Prompts**:
   - Set up and deploy? **Yes**
   - Which scope? **avins-projects-94a43281**
   - Link to existing project? **No** (first time)
   - What's your project's name? **arcfx**
   - In which directory is your code located? **./**
   - Want to override settings? **No**

5. **Production Deployment**:
   ```bash
   vercel --prod
   ```

## After Deployment

Your app will be available at:
- **Vercel URL**: `https://arcfx.vercel.app` (or similar)
- **Custom Domain**: Can be added in project settings

## Continuous Deployment

- Every push to `main` branch = automatic deployment
- Preview deployments for every pull request
- No manual deployment needed after initial setup!

## Project Settings

Access your project settings at:
- https://vercel.com/avins-projects-94a43281/arcfx/settings

## Troubleshooting

**Build fails?**
- Check build logs in Vercel dashboard
- Ensure all dependencies in `package.json`
- Node.js version: Vercel uses 18.x by default

**Can't find repository?**
- Make sure repository is pushed to GitHub first
- Check GitHub connection in Vercel settings
- Repository should be under your GitHub account

**Environment variables not working?**
- Must start with `NEXT_PUBLIC_` for client-side access
- Redeploy after adding variables

## Next Steps After Deployment

1. ✅ Test the deployed app
2. ✅ Share the Vercel URL
3. ✅ Configure custom domain (optional)
4. ✅ Set up environment variables for testnet (when ready)

---

**Ready to deploy?** Start with Option 1 (Dashboard) for the easiest experience!

