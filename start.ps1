$Port = 37891
$Url = "http://localhost:$Port"

Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "         🚀 ITIS Free 开源资源导航站 (Local Dev)" -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "[*] 本地开发端口：$Url" -ForegroundColor Green
Write-Host "[*] 正在启动 Astro 服务并自动打开浏览器..." -ForegroundColor Yellow
Write-Host ""

# 启动后台异步任务在服务就绪后打开浏览器
Start-Job -ScriptBlock {
    param($targetUrl)
    Start-Sleep -Seconds 2
    Start-Process $targetUrl
} -ArgumentList $Url | Out-Null

# 启动 astro dev
npm run dev -- --port $Port --host
