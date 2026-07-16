@echo off
cd /d "%~dp0"

where npm.cmd >nul 2>nul
if %errorlevel%==0 (
  npm.cmd run dev
  exit /b %errorlevel%
)

set "CODEX_NODE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
if exist "%CODEX_NODE%" (
  "%CODEX_NODE%" .\node_modules\next\dist\bin\next dev --hostname 127.0.0.1 --port 3000
  exit /b %errorlevel%
)

echo npm.cmd was not found on PATH, and bundled Codex Node was not found.
echo Install Node.js, then run npm.cmd install and npm.cmd run dev.
exit /b 1
