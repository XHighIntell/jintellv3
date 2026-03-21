@echo off

set working_directory=%cd%
cd /d c:\node
call npx tsc --project "%working_directory%\..\build_debug\tsconfig.json" --noCheck

cd /d "%working_directory%"
echo We are at %cd%
copy "..\build_debug\build.js" "..\build"