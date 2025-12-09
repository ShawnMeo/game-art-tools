# Run Local Development Server
# Starts the local dashboard on a simple HTTP server

Write-Host "🚀 Starting local development server..." -ForegroundColor Cyan
Write-Host ""
Write-Host "Dashboard will be at: http://localhost:3000" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
Write-Host ""

Set-Location game-art-toolkit-local
npx -y serve .
