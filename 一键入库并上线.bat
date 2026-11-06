@echo off
chcp 65001 >nul
title ITIS Free - 一键全自动入库与部署

echo ============================================================
echo   🛸 ITIS Free (free.itis.chat) 本地自动化入库与部署引擎
echo ============================================================
echo.

cd /d "%~dp0"

echo [1/4] 扫描 staging/incoming/ 目录并执行全库查重与合并...
python scripts\ingest.py
if %errorlevel% neq 0 (
    echo [错误] 入库脚本执行失败，请检查上方日志。
    pause
    exit /b %errorlevel%
)
echo.

echo [2/4] 检查是否有数据更新...
git status -s src\content\resources\ | findstr /r "." >nul
if %errorlevel% neq 0 (
    echo [提示] 库内数据已是最新，无新增条目，无需重复构建部署。
    echo.
    echo 按任意键退出...
    pause >nul
    exit /b 0
)

echo [3/4] 检测到新资源入库，开始 Astro 静态生产构建验证...
call npm run build
if %errorlevel% neq 0 (
    echo [错误] Astro 页面构建失败，已自动中止 Git 推送以保护生产环境！
    pause
    exit /b %errorlevel%
)
echo.

echo [4/4] 自动提交并推送至 GitHub Pages...
git add src\content\resources\ staging\
git commit -m "feat(resources): automated local batch ingestion and deployment"
git push origin main
if %errorlevel% neq 0 (
    echo [警告] Git 推送失败，请检查网络连接或 GitHub 访问状态。
    pause
    exit /b %errorlevel%
)

echo.
echo ============================================================
echo   🎉 全部完成！新资源已成功同步并正在发布至 free.itis.chat！
echo ============================================================
echo.
pause
