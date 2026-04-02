#!/bin/bash

# ArcFX Deployment Script
# This script helps you deploy to GitHub and Vercel

echo "🚀 ArcFX Deployment Script"
echo "=========================="
echo ""

# Check if git remote exists
if git remote get-url origin > /dev/null 2>&1; then
    echo "✅ GitHub remote already configured"
    git remote -v
else
    echo "📝 Setting up GitHub remote..."
    echo ""
    echo "Please create a GitHub repository first:"
    echo "1. Go to https://github.com/new"
    echo "2. Repository name: arcfx (or your preferred name)"
    echo "3. Make it Public or Private"
    echo "4. Don't initialize with README"
    echo "5. Click 'Create repository'"
    echo ""
    read -p "Enter your GitHub username: " GITHUB_USER
    read -p "Enter repository name [arcfx]: " REPO_NAME
    REPO_NAME=${REPO_NAME:-arcfx}
    
    git remote add origin "https://github.com/${GITHUB_USER}/${REPO_NAME}.git"
    echo "✅ Remote added: https://github.com/${GITHUB_USER}/${REPO_NAME}.git"
fi

echo ""
echo "📤 Pushing to GitHub..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Successfully pushed to GitHub!"
    echo ""
    echo "🌐 Next Steps for Vercel:"
    echo "=========================="
    echo ""
    echo "Option 1: Deploy via Vercel Dashboard (Recommended)"
    echo "1. Go to https://vercel.com"
    echo "2. Sign in with GitHub"
    echo "3. Click 'Add New' → 'Project'"
    echo "4. Import your repository: ${REPO_NAME}"
    echo "5. Click 'Deploy'"
    echo ""
    echo "Option 2: Deploy via Vercel CLI"
    echo "1. Install Vercel CLI: npm install -g vercel"
    echo "2. Run: vercel login"
    echo "3. Run: vercel"
    echo ""
    echo "📖 See DEPLOYMENT.md for detailed instructions"
else
    echo ""
    echo "❌ Push failed. Please check:"
    echo "- GitHub repository exists"
    echo "- You have write access"
    echo "- Remote URL is correct: git remote -v"
fi

