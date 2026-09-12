@echo off
title Create Desktop Shortcut for MockForge Studio
cd /d "%~dp0"

set SCRIPT="%TEMP%\CreateShortcut.vbs"
set TARGET_PATH=%CD%\Run-MockForge.bat
set DESKTOP_PATH=%USERPROFILE%\Desktop\MockForge Studio.lnk

echo Set oWS = WScript.CreateObject("WScript.Shell") > %SCRIPT%
echo sLinkFile = "%DESKTOP_PATH%" >> %SCRIPT%
echo Set oLink = oWS.CreateShortcut(sLinkFile) >> %SCRIPT%
echo oLink.TargetPath = "%TARGET_PATH%" >> %SCRIPT%
echo oLink.WorkingDirectory = "%CD%" >> %SCRIPT%
echo oLink.Description = "MockForge Studio 3D Perspective Mockup Generator" >> %SCRIPT%
echo oLink.Save >> %SCRIPT%

cscript //nologo %SCRIPT%
del %SCRIPT%

echo.
echo ===================================================
echo  ❖ Desktop Shortcut "MockForge Studio" Created! ❖
echo ===================================================
echo Shortcut Location: %DESKTOP_PATH%
echo Double-click "MockForge Studio" on your Desktop to run!
echo.
pause
