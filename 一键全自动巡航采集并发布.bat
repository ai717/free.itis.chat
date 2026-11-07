@echo off
chcp 65001 >nul
title ITIS Free - 全网全自动巡航采集与发布

echo ============================================================
echo   📡 ITIS Free 全网自主巡航雷达 (无需 Agent / 独立自动化)
echo ============================================================
echo.
echo 正在巡航 GitHub Trending、Hacker News、V2EX 开发者热点...
echo.

cd /d "%~dp0"

echo [1/2] 正在拉取远程最新仓库状态 (Muse / GitHub Actions 更新)...
git pull --rebase origin main
if %errorlevel% neq 0 (
    echo [警告] 远程仓库同步失败，请检查网络或冲突。
    pause
    exit /b %errorlevel%
)
echo.

echo [2/2] 启动巡航爬虫与入库部署管线...
python scripts\auto_collect.py --deploy
if %errorlevel% neq 0 (
    echo.
    echo [警告] 巡航或发布过程出现异常，请检查上方日志。
    pause
    exit /b %errorlevel%
)

echo.
echo ============================================================
echo   ✨ 巡航入库与自动部署流程执行完毕！
echo ============================================================
echo.
pause
