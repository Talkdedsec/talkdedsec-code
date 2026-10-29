# Builds the setup shell around the Inno installer.
# Run after: npm run gulp vscode-win32-x64-user-setup
param(
	[string]$Core = "$PSScriptRoot\..\..\.build\win32-x64\user-setup\TalkdedsecSetup.exe",
	[string]$Out = "$PSScriptRoot\..\..\.build\win32-x64\TalkdedsecSetup.exe"
)
$ErrorActionPreference = 'Stop'
$repo = (Resolve-Path "$PSScriptRoot\..\..").Path
if (-not (Test-Path $Core)) { throw "Inno installer not found: $Core" }

$vswhere = "${env:ProgramFiles(x86)}\Microsoft Visual Studio\Installer\vswhere.exe"
$vs = & $vswhere -products * -latest -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64 -property installationPath
$vcvars = "$vs\VC\Auxiliary\Build\vcvars64.bat"
if (-not (Test-Path $vcvars)) { throw "MSVC not found" }

$version = (Get-Content "$repo\package.json" -Raw | ConvertFrom-Json).version
$num = ($version.Split('.') + @('0', '0', '0', '0'))[0..3] -join ','

$build = "$repo\.build\kurulum"
New-Item -ItemType Directory -Force $build | Out-Null
Copy-Item "$PSScriptRoot\kurulum.rc", "$PSScriptRoot\kurulum.manifest", "$PSScriptRoot\kurulum.cpp" $build -Force
Copy-Item "$repo\tlk\icons\win32\code.ico" "$build\code.ico" -Force
Copy-Item "$repo\tlk\logo.png" "$build\logo.png" -Force
Copy-Item $Core "$build\core.exe" -Force
@"
#define TLK_VERSION L"$version"
#define TLK_VERSION_STR "$version"
#define TLK_VERSION_NUM $num
"@ | Set-Content "$build\version.h" -Encoding Ascii

$outFull = [IO.Path]::GetFullPath($Out)
New-Item -ItemType Directory -Force (Split-Path $outFull) | Out-Null
# vcvars64.bat calls vswhere itself and expects it on PATH
$env:PATH = "$(Split-Path $vswhere);$env:PATH"
$libs = 'd2d1.lib dwrite.lib dwmapi.lib windowscodecs.lib shcore.lib shell32.lib ole32.lib user32.lib gdi32.lib advapi32.lib'
$cmd = "call `"$vcvars`" >nul && cd /d `"$build`" && rc /nologo /fo kurulum.res kurulum.rc && cl /nologo /O2 /MT /EHsc /std:c++17 /utf-8 /W3 /DUNICODE /D_UNICODE /FI version.h kurulum.cpp kurulum.res /link /SUBSYSTEM:WINDOWS $libs /OUT:`"$outFull`""
cmd /c $cmd
if ($LASTEXITCODE -ne 0) { throw "build failed ($LASTEXITCODE)" }
Remove-Item "$build\core.exe"
"{0}  {1:N1} MB" -f $outFull, ((Get-Item $outFull).Length / 1MB)
