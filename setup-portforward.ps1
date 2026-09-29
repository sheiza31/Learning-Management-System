# ================================================
# Podman WSL Port Forwarding Setup
# Run this script as Administrator!
# ================================================

$wslIp = "172.24.236.34"

Write-Host "Setting up port forwarding from Windows -> WSL ($wslIp)..." -ForegroundColor Cyan

# Remove existing rules first (ignore errors if not exist)
netsh interface portproxy delete v4tov4 listenport=3001 listenaddress=0.0.0.0 2>$null
netsh interface portproxy delete v4tov4 listenport=8081 listenaddress=0.0.0.0 2>$null
netsh interface portproxy delete v4tov4 listenport=5433 listenaddress=0.0.0.0 2>$null

# Add port forwarding rules
netsh interface portproxy add v4tov4 listenport=3001 listenaddress=0.0.0.0 connectport=3001 connectaddress=$wslIp
netsh interface portproxy add v4tov4 listenport=8081 listenaddress=0.0.0.0 connectport=8081 connectaddress=$wslIp
netsh interface portproxy add v4tov4 listenport=5433 listenaddress=0.0.0.0 connectport=5433 connectaddress=$wslIp

# Open firewall ports
netsh advfirewall firewall delete rule name="Podman LMS Ports" 2>$null
netsh advfirewall firewall add rule name="Podman LMS Ports" dir=in action=allow protocol=tcp localport=3001,8081,5433

Write-Host ""
Write-Host "Active port forwarding rules:" -ForegroundColor Green
netsh interface portproxy show all

Write-Host ""
Write-Host "Done! Access your app at:" -ForegroundColor Green
Write-Host "  Frontend  -> http://localhost:3001" -ForegroundColor Yellow
Write-Host "  Backend   -> http://localhost:8081/api/v1" -ForegroundColor Yellow
Write-Host "  Postgres  -> localhost:5433" -ForegroundColor Yellow
