# 🚀 Quick Deploy to GitHub & Vercel

## Step 1: Push to GitHub

### Option A: Use the Deployment Script

```bash
cd /Users/vinh/ARC
./deploy.sh
```

Follow the prompts to connect to GitHub and push.

### Option B: Manual GitHub Setup

1. **Create GitHub Repository**:
   - Go to https://github.com/new
   - Repository name: `arcfx` (or your choice)
   - Description: "ArcFX - Multichain DEX on Arc Testnet"
   - Choose Public or Private
   - **Don't** initialize with README
   - Click "Create repository"

2. **Push to GitHub**:
   ```bash
   cd /Users/vinh/ARC
   
   # Add your GitHub repository as remote
   git remote add origin https://github.com/YOUR_USERNAME/arcfx.git
   
   # Push to GitHub
   git push -u origin main
   ```
   
   Replace `YOUR_USERNAME` with your GitHub username and `arcfx` with your repository name.

## Step 2: Deploy to Vercel

### Option A: Vercel Dashboard (Easiest)

1. **Go to Vercel**:
   - Visit https://vercel.com
   - Click "Sign Up" or "Log In"
   - **Sign in with GitHub** (recommended)

2. **Import Project**:
   - Click "Add New..." → "Project"
   - Find and select your `arcfx` repository
   - Click "Import"

3. **Configure Project**:
   - Vercel auto-detects Next.js
   - Framework Preset: **Next.js**
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `.next` (auto-detected)

4. **Environment Variables** (Optional for localhost, required for testnets):
   - Click "Environment Variables"
   - Add if deploying to testnets:
     - `NEXT_PUBLIC_USDC_ADDRESS` = your testnet USDC address
     - `NEXT_PUBLIC_SWAP_BRIDGE_ADDRESS` = your testnet SwapBridge address
     - `NEXT_PUBLIC_LOCAL_CHAIN_ID` = 31337 (or testnet chain ID)
     - `NEXT_PUBLIC_LOCAL_RPC` = your RPC URL

5. **Deploy**:
   - Click "Deploy"
   - Wait 2-3 minutes for build
   - Your app will be live! 🎉

### Option B: Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy from project directory
cd /Users/vinh/ARC
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? arcfx (or your choice)
# - Directory? ./
# - Override settings? No
```

## ✅ After Deployment

Your app will be live at:
- **Vercel URL**: `https://your-project.vercel.app`
- **Custom Domain**: Add in Vercel project settings → Domains

## 🔄 Continuous Deployment

- Every push to `main` branch = automatic deployment
- Vercel creates preview deployments for PRs
- No manual deployment needed!

## 📝 Important Notes

### What Gets Deployed
- ✅ Frontend (Next.js app)
- ✅ All UI components
- ✅ Smart contract interfaces (ABIs)

### What Doesn't Get Deployed
- ❌ Hardhat node (local only)
- ❌ Contract deployment scripts (deploy separately to testnets)
- ❌ `.env.local` file (use Vercel environment variables)

### For Testnet/Mainnet
1. Deploy contracts to testnet/mainnet separately
2. Update environment variables in Vercel with testnet addresses
3. Update chain configurations in `components/ArcFX.tsx`
4. Redeploy (automatic on git push)

## 🐛 Troubleshooting

**Build fails?**
- Check Vercel build logs
- Ensure all dependencies in `package.json`
- Verify Node.js version (Vercel uses 18.x)

**Environment variables not working?**
- Must start with `NEXT_PUBLIC_` for client-side access
- Redeploy after adding variables

**Can't connect to GitHub?**
- Check repository is public or you have access
- Verify remote URL: `git remote -v`

## 📚 More Help

- **Full Guide**: See [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Vercel Docs**: https://vercel.com/docs
- **GitHub Docs**: https://docs.github.com

Happy deploying! 🚀

