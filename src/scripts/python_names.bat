@echo off
CALL "C:\emma\done\fs-pro-server\src\scripts\python\venv\Scripts\activate.bat"
CALL names %*
CALL "C:\emma\done\fs-pro-server\src\scripts\python\venv\Scripts\deactivate.bat"