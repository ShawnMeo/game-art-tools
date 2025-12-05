# GitHub Pages Deployment Guide

## Setup Complete! ✅

Both apps are now configured for GitHub Pages deployment.

## Next Steps

### 1. Create GitHub Repositories

You need to create **two separate repositories** on GitHub:

1. Go to [github.com/new](https://github.com/new)
2. Create first repo: `channel-packer`
3. Create second repo: `texel-architect`

### 2. Update package.json with Your Username

Replace `YOURUSERNAME` in both `package.json` files with your actual GitHub username:

**Channel Packer:**
- File: `channel-packer/package.json`
- Change: `"homepage": "https://YOURUSERNAME.github.io/channel-packer"`
- To: `"homepage": "https://your-actual-username.github.io/channel-packer"`

**Texel Architect:**
- File: `texel-architect/package.json`
- Change: `"homepage": "https://YOURUSERNAME.github.io/texel-architect"`
- To: `"homepage": "https://your-actual-username.github.io/texel-architect"`

### 3. Initialize Git and Push to GitHub

For **Channel Packer**:
```bash
cd "c:/Users/thega/Desktop/DeepSpace/saas exploration/channel-packer"
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOURUSERNAME/channel-packer.git
git push -u origin main
```

For **Texel Architect**:
```bash
cd "c:/Users/thega/Desktop/DeepSpace/saas exploration/texel-architect"
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOURUSERNAME/texel-architect.git
git push -u origin main
```

### 4. Deploy to GitHub Pages

Once pushed to GitHub, deploy with:

**Channel Packer:**
```bash
cd "c:/Users/thega/Desktop/DeepSpace/saas exploration/channel-packer"
npm run deploy
```

**Texel Architect:**
```bash
cd "c:/Users/thega/Desktop/DeepSpace/saas exploration/texel-architect"
npm run deploy
```

### 5. Enable GitHub Pages (One-Time Setup)

1. Go to your repo on GitHub
2. Click **Settings** → **Pages**
3. Under "Source", select `gh-pages` branch
4. Click **Save**

Your apps will be live at:
- `https://YOURUSERNAME.github.io/channel-packer/`
- `https://YOURUSERNAME.github.io/texel-architect/`

---

## Future Updates

Whenever you make changes:
```bash
# Make your code changes
git add .
git commit -m "Update feature X"
git push

# Deploy to GitHub Pages
npm run deploy
```

---

## What I've Done

✅ Installed `gh-pages` package in both apps
✅ Added deployment scripts to `package.json`
✅ Configured Vite base paths for GitHub Pages
✅ Created this deployment guide

**You just need to**:
1. Create the GitHub repos
2. Replace `YOURUSERNAME` with your GitHub username
3. Push the code
4. Run `npm run deploy`
