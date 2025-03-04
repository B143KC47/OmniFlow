@echo off
echo ======================================
echo    OmniFlow 智能流程处理平台启动工具
echo ======================================
echo.

:: 检查Python是否安装
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo [错误] 未检测到Python安装，请安装Python 3.8或更高版本。
    echo 您可以从 https://www.python.org/downloads/ 下载Python。
    pause
    exit /b 1
)

echo [信息] 检测到Python安装...

:: 检查requirements.txt是否存在
if not exist requirements.txt (
    echo [警告] 未找到requirements.txt文件。可能缺少必要的依赖库。
    
    :: 创建一个基本的requirements.txt
    echo flask > requirements.txt
    echo openai >> requirements.txt
    echo python-dotenv >> requirements.txt
    
    echo [信息] 已创建基本的requirements.txt文件。
)

:: 检查data目录是否存在
if not exist data (
    echo [信息] 创建必要的目录结构...
    mkdir data
    mkdir data\flows
    mkdir data\chats
    mkdir data\config
)

:: 询问是否安装依赖
echo.
set /p install_deps="是否安装/更新依赖库? (y/n): "
if /i "%install_deps%"=="y" (
    echo [信息] 正在安装依赖库...
    pip install -r requirements.txt
    if %errorlevel% neq 0 (
        echo [错误] 依赖库安装失败。
        pause
        exit /b 1
    )
    echo [信息] 依赖库安装完成。
)

:: 启动OmniFlow
echo.
echo [信息] 正在启动OmniFlow...
echo [信息] 启动后，您可以通过访问 http://localhost:5000 使用OmniFlow
echo [信息] 按Ctrl+C可以停止服务
echo.
python main.py
pause