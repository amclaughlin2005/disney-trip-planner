#!/bin/bash

# 🚀 Disney Trip Planner - Quick Deploy Script
# This script helps you deploy your app to various platforms

echo "🏰 Disney Trip Planner - Deployment Helper"
echo "=========================================="

# Check if build exists
if [ ! -d "build" ]; then
    echo "📦 Building production version..."
    npm run build
    if [ $? -ne 0 ]; then
        echo "❌ Build failed! Please fix errors and try again."
        exit 1
    fi
fi

echo "✅ Build folder ready!"
echo ""

echo "🌐 Choose your deployment platform:"
echo "1) Netlify (Drag & Drop)"
echo "2) Vercel (CLI)"
echo "3) GitHub Pages"
echo "4) Firebase Hosting"
echo "5) Just show me the build folder"
echo ""

read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        echo ""
        echo "🎯 Netlify Deployment:"
        echo "1. Go to https://netlify.com"
        echo "2. Sign up/login"
        echo "3. Drag the 'build' folder to the deploy area"
        echo "4. Get your live URL!"
        echo ""
        echo "📁 Your build folder is ready at: $(pwd)/build"
        open build 2>/dev/null || echo "Open your file manager and navigate to the build folder"
        ;;
    2)
        echo ""
        echo "🎯 Vercel Deployment:"
        if command -v vercel &> /dev/null; then
            echo "Running: npx vercel"
            npx vercel
        else
            echo "Installing Vercel CLI and deploying..."
            npx vercel
        fi
        ;;
    3)
        echo ""
        echo "🎯 GitHub Pages Setup:"
        echo "1. First, install gh-pages:"
        echo "   npm install --save-dev gh-pages"
        echo ""
        echo "2. Add to package.json scripts:"
        echo '   "predeploy": "npm run build",'
        echo '   "deploy": "gh-pages -d build"'
        echo ""
        echo "3. Run: npm run deploy"
        echo ""
        read -p "Install gh-pages now? (y/n): " install_gh
        if [ "$install_gh" = "y" ]; then
            npm install --save-dev gh-pages
            echo "✅ gh-pages installed! Now add scripts to package.json and run 'npm run deploy'"
        fi
        ;;
    4)
        echo ""
        echo "🎯 Firebase Hosting:"
        echo "1. Install Firebase CLI: npm install -g firebase-tools"
        echo "2. Login: firebase login"
        echo "3. Initialize: firebase init hosting"
        echo "4. Deploy: firebase deploy"
        echo ""
        read -p "Install Firebase CLI now? (y/n): " install_firebase
        if [ "$install_firebase" = "y" ]; then
            npm install -g firebase-tools
            echo "✅ Firebase CLI installed! Run 'firebase login' to continue"
        fi
        ;;
    5)
        echo ""
        echo "📁 Build folder location: $(pwd)/build"
        echo "📊 Build size:"
        du -sh build/
        echo ""
        echo "📋 Files in build folder:"
        ls -la build/
        open build 2>/dev/null || echo "Open your file manager and navigate to the build folder"
        ;;
    *)
        echo "❌ Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo ""
echo "🎉 Happy deploying! Your Disney Trip Planner will help families create magical vacations! ✨" 