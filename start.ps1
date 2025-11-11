# BlazeIoT Platform Startup Script
# This script starts both the backend server and frontend dashboard

Write-Host "🔥 BlazeIoT Solutions Platform - Starting..." -ForegroundColor Cyan
Write-Host ""

# Start Backend Server
Write-Host "📊 Starting Backend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; Write-Host '🔥 Backend Server' -ForegroundColor Green; node server.js"

# Wait for backend to start
Write-Host "⏳ Waiting for backend to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Start Frontend Dashboard
Write-Host "🎨 Starting Frontend Dashboard..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\admin-dashboard'; Write-Host '🎨 Frontend Dashboard' -ForegroundColor Green; npm run dev"

# Wait a bit and open browser
Start-Sleep -Seconds 3
Write-Host ""
Write-Host "✅ Platform Starting!" -ForegroundColor Green
Write-Host ""
Write-Host "📍 Backend:  http://localhost:3000" -ForegroundColor Cyan
Write-Host "📍 Dashboard: http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔐 Login Credentials:" -ForegroundColor Yellow
Write-Host "   Username: admin" -ForegroundColor White
Write-Host "   Password: admin123" -ForegroundColor White
Write-Host ""
Write-Host "⏳ Opening dashboard in 5 seconds..." -ForegroundColor Yellow

Start-Sleep -Seconds 5
Start-Process "http://localhost:5173"

Write-Host ""
Write-Host "✨ Platform is ready! Check the new windows for server logs." -ForegroundColor Green
Write-Host "Press any key to exit this window..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
