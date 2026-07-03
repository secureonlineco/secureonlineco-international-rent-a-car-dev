@echo off
echo.
echo ================================
echo Publishing to GitHub...
echo ================================

git add .

git commit -m "Update"

git push

echo.
echo ================================
echo Finished!
echo Press any key to exit...
echo ================================
pause