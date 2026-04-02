# Deployment Guide - GitHub & Vercel

## 🚀 Quick Deploy to Vercel

### Step 1: Push to GitHub

1. **Initialize Git Repository** (if not already done):
   ```bash
   cd /Users/vinh/ARC
   git init
   git add .
   git commit -m "Initial commit: ArcFX project"
   ```

2. **Create GitHub Repository**:
   - Go to https://github.com/new
   - Repository name: `arcfx` (or your preferred name)
   - Description: "ArcFX - Multichain DEX on Arc Testnet"
   - Make it **Public** or **Private** (your choice)
   - Don't initialize with README (we already have one)
   - Click "Create repository"

3. **Push to GitHub**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/arcfx.git
   git branch -M main
   git push -u origin main
   ```
   Replace `YOUR_USERNAME` with your GitHub username.

### Step 2: Deploy to Vercel

#### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Go to Vercel**:
   - Visit https://vercel.com
   - Sign in with GitHub

2. **Import Project**:
   - Click "Add New" → "Project"
   - Import your GitHub repository (`arcfx`)
   - Vercel will auto-detect Next.js

3. **Configure Environment Variables**:
   - Before deploying, add environment variables in Vercel dashboard:
     - Go to Project Settings → Environment Variables
     - Add these (if deploying to testnets):
       ```
       NEXT_PUBLIC_USDC_ADDRESS=<your_usdc_address>
       NEXT_PUBLIC_SWAP_BRIDGE_ADDRESS=<your_swap_address>
       NEXT_PUBLIC_LOCAL_CHAIN_ID=31337
       NEXT_PUBLIC_LOCAL_RPC=http://127.0.0.1:8545
       ```
     - **Note**: For production/testnet, update these values
   
4. **Deploy**:
   - Click "Deploy"
   - Wait for build to complete (~2-3 minutes)
   - Your app will be live at `https://your-project.vercel.app`

#### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   cd /Users/vinh/ARC
   vercel
   ```
   - Follow the prompts
   - Choose production deployment

4. **Set Environment Variables**:
   ```bash
   vercel env add NEXT_PUBLIC_USDC_ADDRESS
   vercel env add NEXT_PUBLIC_SWAP_BRIDGE_ADDRESS
   vercel env add NEXT_PUBLIC_LOCAL_CHAIN_ID
   vercel env add NEXT_PUBLIC_LOCAL_RPC
   ```

### Step 3: Configure for Production

For production/testnet deployment:

1. **Update Chain Configuration**:
   - Edit `components/ArcFX.tsx`
   - Update chain configurations with real testnet/mainnet addresses
   - Set default chain to testnet (not localhost)

2. **Environment Variables in Vercel**:
   - Go to Project Settings → Environment Variables
   - Update with production addresses:
     ```
     NEXT_PUBLIC_USDC_ADDRESS=<testnet_usdc_address>
     NEXT_PUBLIC_SWAP_BRIDGE_ADDRESS=<testnet_swap_address>
     ```

3. **Redeploy**:
   - Vercel automatically redeploys on git push
   - Or manually redeploy from dashboard

## 📝 Important Notes

### Local Development Files
- `.env.local` is ignored by git (already in .gitignore)
- Don't commit private keys or sensitive data
- Use Vercel environment variables for production secrets

### Build Configuration
- `vercel.json` is configured for Next.js
- Build command: `npm run build`
- Framework: Next.js (auto-detected)

### Hardhat Contracts
- Contract files are included in git
- Hardhat artifacts are excluded (in .gitignore)
- For production, deploy contracts separately to testnet/mainnet

## 🔗 Useful Links

- **Vercel Dashboard**: https://vercel.com/dashboard
- **GitHub**: https://github.com
- **Vercel Docs**: https://vercel.com/docs

## 🐛 Troubleshooting

**Build fails on Vercel?**
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify Node.js version (Vercel uses 18.x by default)

**Environment variables not working?**
- Make sure they start with `NEXT_PUBLIC_` for client-side access
- Redeploy after adding environment variables

**GitHub push fails?**
- Check you have write access to repository
- Verify remote URL is correct: `git remote -v`

## 🎉 After Deployment

Your app will be live at:
- **Vercel URL**: `https://your-project.vercel.app`
- **Custom Domain**: Add in Vercel project settings

Enjoy your deployed ArcFX! 🚀

