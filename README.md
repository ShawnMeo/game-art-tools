# Game Art Toolkit

A collection of web-based tools designed for game artists and technical artists.

## 🚀 Quick Start

### Local Development
```powershell
.\run-local.ps1
```
Opens dashboard at http://localhost:3000

### Deploy to GitHub Pages
```powershell
.\deploy.ps1
git add -A
git commit -m "Deploy: update tools"
git push origin master
```

---

## 📁 Folder Structure

| Folder | Purpose |
|--------|---------|
| `Remote/` | GitHub Pages (built files) |
| `Local/` | Local development (gitignored) |

---

## 🛠️ Tools Included

| Tool | Description |
|------|-------------|
| ✅ Asset Naming Validator | Validate file names against UE naming conventions |
| 📦 Channel Packer | Pack grayscale masks into RGB channels |
| 🔢 LOD Budget Calculator | Calculate polygon budgets for LOD stages |
| 📐 Texel Architect | Plan texel density for 3D assets |
| 🗺️ Trim Sheet Planner | Layout trim sheets for modular texturing |
| 🖼️ Material Sheet Generator | Generate texture map presentation sheets |

---

## 📦 Development Workflow

1. Make changes in `Local/` (local dev)
2. Test locally with `.\run-local.ps1`
3. When ready, run `.\deploy.ps1` to build and sync to `Remote/`
4. Commit and push to deploy to GitHub Pages
