# Run Dev Workspace
# Starts the dev copy dashboard

Write-Host 'ðŸš Starting DEV server...' -ForegroundColor Cyan
Write-Host ''
Write-Host 'Dashboard will be at: http://localhost:3000' -ForegroundColor Green
Write-Host 'Press Ctrl+C to stop' -ForegroundColor Yellow
Write-Host ''

Set-Location dev
npx -y serve .
