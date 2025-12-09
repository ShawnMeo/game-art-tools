# Deploy Script - Builds local tools and syncs to build folder
# Run this after making changes to push to GitHub Pages

Write-Host "🚀 Starting deployment..." -ForegroundColor Cyan

$tools = @(
    'channel-packer',
    'trim-sheet-planner'
)

# Build each tool
foreach ($tool in $tools) {
    $toolPath = "game-art-toolkit-local\$tool"
    if (Test-Path $toolPath) {
        Write-Host "📦 Building $tool..." -ForegroundColor Yellow
        Push-Location $toolPath
        npm run build
        Pop-Location
        
        # Copy dist to build
        $src = "$toolPath\dist\*"
        $dest = "build\$tool"
        Write-Host "📁 Copying to build..." -ForegroundColor Yellow
        Remove-Item -Recurse -Force $dest -ErrorAction SilentlyContinue
        New-Item -ItemType Directory -Path $dest -Force | Out-Null
        Copy-Item -Path $src -Destination $dest -Recurse
    }
}

# Copy materials-sheet-generator (no build needed)
Write-Host "📁 Copying materials-sheet-generator..." -ForegroundColor Yellow
$dest = "build\materials-sheet-generator"
Remove-Item -Recurse -Force $dest -ErrorAction SilentlyContinue
Copy-Item -Path "game-art-toolkit-local\materials-sheet-generator" -Destination "build\" -Recurse

Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  git add -A"
Write-Host "  git commit -m 'Deploy: update build tools'"
Write-Host "  git push origin master"
