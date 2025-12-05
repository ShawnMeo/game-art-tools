$projects = @(
    "asset-naming-validator",
    "channel-packer",
    "lod-budget-calculator",
    "texel-architect",
    "trim-sheet-planner"
)

Write-Host "Starting Build Process for $($projects.Count) tools..." -ForegroundColor Cyan

foreach ($proj in $projects) {
    Write-Host "`nBuilding $proj..." -ForegroundColor Yellow
    Push-Location $proj
    
    if (Test-Path "package.json") {
        Write-Host "   Installing dependencies..." -ForegroundColor Gray
        npm install --silent | Out-Null
        
        Write-Host "   Running build..." -ForegroundColor Gray
        npm run build | Out-Null
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   Build successful!" -ForegroundColor Green
        }
        else {
            Write-Host "   Build failed!" -ForegroundColor Red
        }
    }
    else {
        Write-Host "   No package.json found, skipping." -ForegroundColor Red
    }
    
    Pop-Location
}

Write-Host "`nAll operations complete! You can now commit and push." -ForegroundColor Cyan
