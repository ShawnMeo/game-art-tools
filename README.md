# 🛠️ Game Art Toolkit

A collection of free, open-source, web-based tools designed for game artists and technical artists.

**[🚀 Launch the Toolkit](https://shawnmeo.github.io/game-art-tools/)**

---

## 🎮 Tools Included

| Tool | Description |
|------|-------------|
| 📦 **Channel Packer** | Pack grayscale masks into RGB/RGBA channels for optimized shaders |
| 🗺️ **Trim Sheet Planner** | Layout trim sheets for modular texturing workflows |
| 🖼️ **Material Sheet Generator** | Generate texture map presentation sheets |
| ✅ **Asset Naming Validator** | Validate file names against UE naming conventions |
| 📐 **Texel Architect** | Plan texel density for 3D assets |
| 🔢 **LOD Budget Calculator** | Calculate polygon budgets for LOD stages |
| 🔄 **Pipeline Automation** | Track 3D assets through pipeline stages |

---

## 📁 Project Structure

```
game-art-tools/
├── tools/          # Source code for each tool
├── docs/           # Built files served via GitHub Pages
├── deploy.ps1      # Build & sync tools/ → docs/
└── index.html      # Redirect to docs/
```

---

## 🚀 Getting Started

### Run a tool locally (development)
```bash
cd tools/channel-packer
npm install
npm run dev
```

### Deploy to GitHub Pages
```powershell
.\deploy.ps1
git add -A
git commit -m "Deploy: update tools"
git push origin master
```

---

## 🤝 Contributing

1. Fork the repo
2. Make your changes in the `tools/` directory
3. Test locally with `npm run dev`
4. Run `.\deploy.ps1` to build
5. Open a Pull Request

---

## ☕ Support

If you find these tools useful, consider supporting development:

[![Ko-fi](https://img.shields.io/badge/Ko--fi-Support-ff5e5b?logo=kofi)](https://ko-fi.com/shawn_dis)

---

© 2025 Game Art Tools. Built for game artists, by game artists.
