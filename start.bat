@echo off
chcp 65001 >nul
title ITIS Free 本地极速启动器

set PORT=37891
set HOST=localhost

echo =======================================================
echo          🚀 ITIS Free 开源资源导航站 (Local Dev)
echo =======================================================
echo.
echo [*] 本地端口：http://%HOST%:%PORT%
echo [*] 正在唤醒 Astro 极速热更新开发服务...
echo.

:: 延迟 2 秒后自动在默认浏览器中打开页面
start "" cmd /c "timeout /t 2 /nobreak >nul && start http://%HOST%:%PORT%"

:: 启动本地服务，指定端口并监听本地网段
call npm run dev -- --port %PORT% --host

pause
