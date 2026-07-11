@echo off
REM ============================================================
REM  Recompila el APK de Android de RottenTomatos.
REM  Uso: doble clic, o desde una terminal:  build-apk.cmd
REM
REM  Si cambiaste de red WiFi, primero actualiza la IP de tu PC en:
REM    src\environments\environment.prod.ts  (campo apiUrl)
REM  y luego corre este script.
REM ============================================================
setlocal
cd /d "%~dp0"
set "JAVA_HOME=%LOCALAPPDATA%\Android\jdk-21"
set "ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk"
set "ANDROID_SDK_ROOT=%ANDROID_HOME%"

echo [1/3] Compilando frontend (Angular)...
call node node_modules\@angular\cli\bin\ng.js build || goto :error

echo [2/3] Copiando web a Android (Capacitor sync)...
call node node_modules\@capacitor\cli\bin\capacitor sync android || goto :error

echo [3/3] Compilando APK (Gradle)...
call "%~dp0android\gradlew.bat" -p "%~dp0android" assembleDebug -Dorg.gradle.java.home="%LOCALAPPDATA%\Android\jdk-21" || goto :error

copy /Y "%~dp0android\app\build\outputs\apk\debug\app-debug.apk" "%~dp0..\RottenTomatos-debug.apk" >nul

echo.
echo ============================================================
echo  APK generado en:
echo   android\app\build\outputs\apk\debug\app-debug.apk
echo  (copiado tambien a la raiz: RottenTomatos-debug.apk)
echo ============================================================
goto :eof

:error
echo.
echo  ERROR al compilar. Revisa el mensaje de arriba.
exit /b 1
