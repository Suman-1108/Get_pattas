@echo off
title Get Pattas - Local Server
color 0A
echo.
echo  ============================================
echo   GET PATTAS KADAI - Local Web Server
echo  ============================================
echo.
echo  Starting server at: http://localhost:8000
echo.
echo  Open these URLs in your browser:
echo  ------------------------------------------
echo  Main Site:   http://localhost:8000
echo  Shop 001:    http://localhost:8000/shopno001
echo  Shop 002:    http://localhost:8000/shopno002
echo  Shop 003:    http://localhost:8000/shopno003
echo  Shop 004:    http://localhost:8000/shopno004
echo  Admin:       http://localhost:8000/admin.html
echo  ------------------------------------------
echo.
echo  Press Ctrl+C to stop the server.
echo.
python -m http.server 8000
pause
