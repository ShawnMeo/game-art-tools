# Deploy Script - Builds tools from source and syncs to docs/ for GitHub Pages
# Run this after making changes to push to GitHub Pages

Write-Host "🚀 Starting deployment..." -ForegroundColor Cyan

$tools = @(
    'channel-packer',
    'trim-sheet-planner'
)

# Build each tool
foreach ($tool in $tools) {
    $toolPath = "tools\$tool"
    if (Test-Path $toolPath) {
        Write-Host "📦 Building $tool..." -ForegroundColor Yellow
        Push-Location $toolPath
        npm run build
        Pop-Location
        
        # Copy dist to docs
        $src = "$toolPath\dist\*"
        $dest = "docs\$tool"
        Write-Host "📁 Copying to docs..." -ForegroundColor Yellow
        Remove-Item -Recurse -Force $dest -ErrorAction SilentlyContinue
        New-Item -ItemType Directory -Path $dest -Force | Out-Null
        Copy-Item -Path $src -Destination $dest -Recurse
    }
}

# Copy materials-sheet-generator (no build needed)
Write-Host "📁 Copying materials-sheet-generator..." -ForegroundColor Yellow
$dest = "docs\materials-sheet-generator"
Remove-Item -Recurse -Force $dest -ErrorAction SilentlyContinue
Copy-Item -Path "tools\materials-sheet-generator" -Destination "docs\" -Recurse

Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  git add -A"
Write-Host "  git commit -m 'Deploy: update tools'"
Write-Host "  git push origin master"
