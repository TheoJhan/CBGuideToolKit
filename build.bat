@echo off
echo Building CB Guide Toolkit (Obfuscated Version)...
echo.

echo Cleaning previous build...
npm run clean

echo.
echo Building obfuscated version...
npm run build

echo.
echo Build completed! 
echo Obfuscated files are in the 'dist' directory.
echo.
echo To use the obfuscated extension:
echo 1. Open Chrome and go to chrome://extensions/
echo 2. Enable "Developer mode"
echo 3. Click "Load unpacked"
echo 4. Select the 'dist' folder
echo.
pause 