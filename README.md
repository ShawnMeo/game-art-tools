# Game Art Toolkit

A collection of web-based tools designed for game artists and technical artists. All tools are accessible via the main dashboard.

## 🚀 Dashboard
Open [`game-art-toolkit/index.html`](./game-art-toolkit/index.html) in your browser to access all tools.

---

## 🛠️ Tools Included

### ✅ [Asset Naming Validator](./game-art-toolkit/asset-naming-validator/)
Validates file names against project naming conventions to ensure consistency across your project.

### 📦 [Channel Packer](./game-art-toolkit/channel-packer/)
Pack different grayscale images into the RGB channels of a single texture for optimized shaders.

### 🔢 [LOD Budget Calculator](./game-art-toolkit/lod-budget-calculator/)
Calculate and visualize polygon budgets for different Level of Detail (LOD) stages.

### 📐 [Texel Architect](./game-art-toolkit/texel-architect/)
Plan and calculate texel density for 3D assets to maintain consistent texture resolution.

### 🗺️ [Trim Sheet Planner](./game-art-toolkit/trim-sheet-planner/)
Plan and lay out trim sheets for optimized modular environment texturing.

### 🖼️ [Material Sheet Generator](./game-art-toolkit/materials-sheet-generator/)
Generate presentation sheets from your texture maps with customizable layouts.

---

## 📁 Project Structure
```
game-art-toolkit/
├── index.html                    # Main dashboard
├── asset-naming-validator/
├── channel-packer/
├── lod-budget-calculator/
├── materials-sheet-generator/
├── texel-architect/
└── trim-sheet-planner/
```

## Development
Each tool is contained in its own subdirectory. Most are Vite-based web projects with a `/dist` folder containing the built output.
