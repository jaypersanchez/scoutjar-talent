@echo off
REM ---------------------------------------------
REM Start ADB server
adb kill-server
adb start-server
echo ADB Server started.

REM ---------------------------------------------
REM Start Android Studio (optional)
echo Opening Android Studio...
start "" "C:\Program Files\Android\Android Studio\bin\studio64.exe"

REM ---------------------------------------------
REM Pause and wait for user to launch Emulator manually
echo.
echo ========================================
echo Please manually start your Emulator now from Android Studio!
echo ========================================
pause

REM ---------------------------------------------
REM After Emulator launched, start WSL and mobile dev
echo Starting WSL Mobile Dev Environment...

wsl.exe bash -ic "~/start-mobile-dev.sh"

REM ---------------------------------------------
echo All done! You can now work on your Expo app.
pause
