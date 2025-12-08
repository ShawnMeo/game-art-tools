# Deploy Script - Builds local tools and syncs to remote folder
# Run this after making changes to push to GitHub Pages

Write-Host "🚀 Starting deployment..." -ForegroundColor Cyan

$tools = @(
    'asset-naming-validator',
    'channel-packer',
    'lod-budget-calculator',
    'texel-architect',
    'trim-sheet-planner'
)

# Build each tool
foreach ($tool in $tools) {
    $toolPath = "game-art-toolkit\$tool"
    if (Test-Path $toolPath) {
        Write-Host "📦 Building $tool..." -ForegroundColor Yellow
        Push-Location $toolPath
        npm run build
        Pop-Location
        
        # Copy dist to remote
        $src = "$toolPath\dist\*"
        $dest = "game-art-toolkit-remote\$tool"
        Write-Host "📁 Copying to remote..." -ForegroundColor Yellow
        Remove-Item -Recurse -Force $dest -ErrorAction SilentlyContinue
        New-Item -ItemType Directory -Path $dest -Force | Out-Null
        Copy-Item -Path $src -Destination $dest -Recurse
    }
}

# Copy materials-sheet-generator (no build needed)
Write-Host "📁 Copying materials-sheet-generator..." -ForegroundColor Yellow
$dest = "game-art-toolkit-remote\materials-sheet-generator"
Remove-Item -Recurse -Force $dest -ErrorAction SilentlyContinue
Copy-Item -Path "game-art-toolkit\materials-sheet-generator" -Destination "game-art-toolkit-remote\" -Recurse

Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  git add -A"
Write-Host "  git commit -m 'Deploy: update remote tools'"
Write-Host "  git push origin master"
