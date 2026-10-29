# Repository images: editor and setup screenshots (window-only capture), README banner, social preview.
# Usage: powershell -File tlk/repo/gorsel.ps1 [-App <VSCode-win32-x64 dir>] [-Setup <TalkdedsecSetup.exe>]
param(
	[string]$App = "$PSScriptRoot\..\..\..\VSCode-win32-x64",
	[string]$Setup = "$PSScriptRoot\..\..\.build\win32-x64\TalkdedsecSetup.exe",
	[string]$Demo = "$env:TEMP\tlk-demo",
	[string]$Out = "$PSScriptRoot\github\assets",
	[string]$Social = "$env:USERPROFILE\Desktop\Medya\og-images\talkdedsec-code.png"
)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
Add-Type @"
using System; using System.Runtime.InteropServices;
public static class TlkWin {
	[DllImport("user32.dll")] public static extern bool SetProcessDpiAwarenessContext(IntPtr v);
	[DllImport("user32.dll")] public static extern bool PrintWindow(IntPtr h, IntPtr hdc, uint flags);
	[DllImport("user32.dll")] public static extern bool GetClientRect(IntPtr h, out RECT r);
	[DllImport("user32.dll")] public static extern bool SetWindowPos(IntPtr h, IntPtr after, int x, int y, int cx, int cy, uint flags);
	[DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr h, int cmd);
	public struct RECT { public int Left, Top, Right, Bottom; }
}
"@
[TlkWin]::SetProcessDpiAwarenessContext([IntPtr](-4)) | Out-Null
New-Item -ItemType Directory -Force $Out | Out-Null

function Wait-Window([string]$name, [string]$pathLike, [int]$seconds = 40) {
	$sw = [Diagnostics.Stopwatch]::StartNew()
	while ($sw.Elapsed.TotalSeconds -lt $seconds) {
		$p = Get-Process $name -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowHandle -ne 0 -and $_.Path -like $pathLike } | Select-Object -First 1
		if ($p) { return $p }
		Start-Sleep -Milliseconds 250
	}
	throw "$name window did not appear"
}
function Save-Window([IntPtr]$h, [string]$file) {
	$r = New-Object TlkWin+RECT
	[TlkWin]::GetClientRect($h, [ref]$r) | Out-Null
	$bmp = New-Object Drawing.Bitmap ($r.Right - $r.Left), ($r.Bottom - $r.Top)
	$g = [Drawing.Graphics]::FromImage($bmp)
	$hdc = $g.GetHdc()
	# PW_CLIENTONLY | PW_RENDERFULLCONTENT: only this window, including GPU-composed content
	[TlkWin]::PrintWindow($h, $hdc, 3) | Out-Null
	$g.ReleaseHdc($hdc); $g.Dispose()
	$bmp.Save($file, [Drawing.Imaging.ImageFormat]::Png)
	$bmp
}

# ---- editor ----
$exe = (Resolve-Path "$App\Talkdedsec.exe").Path
$proj = (Resolve-Path "$Demo\aurora").Path
$prof = (Resolve-Path "$Demo\profile").Path
$p = Start-Process $exe -ArgumentList "--user-data-dir=`"$prof\data`"", "--extensions-dir=`"$prof\ext`"", "--new-window", "`"$proj`"", "`"$proj\src\palette.ts`"" -PassThru
$w = Wait-Window 'Talkdedsec' "$((Resolve-Path $App).Path)*"
[TlkWin]::ShowWindow($w.MainWindowHandle, 9) | Out-Null
[TlkWin]::SetWindowPos($w.MainWindowHandle, [IntPtr]::Zero, 80, 60, 1600, 1000, 0x0040) | Out-Null
Start-Sleep -Seconds 9
$editor = Save-Window $w.MainWindowHandle "$Out\editor.png"
Get-Process Talkdedsec -ErrorAction SilentlyContinue | Where-Object { $_.Path -like "$((Resolve-Path $App).Path)*" } | Stop-Process -Force

# ---- setup ----
$s = Start-Process (Resolve-Path $Setup).Path -ArgumentList '--lang=en' -PassThru
$sw = Wait-Window 'TalkdedsecSetup' '*'
Start-Sleep -Seconds 3
$setupBmp = Save-Window $sw.MainWindowHandle "$Out\setup.png"
Stop-Process -Id $s.Id -Force

# ---- shared drawing ----
$yellow = [Drawing.Color]::FromArgb(0xFF, 0xD6, 0x00)
function New-Canvas($w, $h) {
	$bmp = New-Object Drawing.Bitmap $w, $h
	$g = [Drawing.Graphics]::FromImage($bmp)
	$g.SmoothingMode = 'AntiAlias'; $g.InterpolationMode = 'HighQualityBicubic'; $g.TextRenderingHint = 'AntiAliasGridFit'
	$bg = New-Object Drawing.Drawing2D.LinearGradientBrush ([Drawing.Point]::new(0, 0)), ([Drawing.Point]::new(0, $h)), ([Drawing.Color]::FromArgb(0x1a, 0x1a, 0x1a)), ([Drawing.Color]::FromArgb(0x2a, 0x2a, 0x2a))
	$g.FillRectangle($bg, 0, 0, $w, $h)
	return $bmp, $g
}
# image on the right that fades into the panel on its left edge
function Draw-Right($g, $img, $x, $w, $h) {
	$scale = [Math]::Max($w / $img.Width, $h / $img.Height)
	$sw = [int]($w / $scale); $sh = [int]($h / $scale)
	$g.DrawImage($img, [Drawing.Rectangle]::new($x, 0, $w, $h), [Drawing.Rectangle]::new(0, 0, $sw, $sh), 'Pixel')
	$fade = New-Object Drawing.Drawing2D.LinearGradientBrush ([Drawing.Point]::new($x - 1, 0)), ([Drawing.Point]::new($x + 160, 0)), ([Drawing.Color]::FromArgb(255, 0x22, 0x22, 0x22)), ([Drawing.Color]::FromArgb(0, 0x22, 0x22, 0x22))
	$g.FillRectangle($fade, $x - 1, 0, 161, $h)
}
$mono = New-Object Drawing.Font 'Consolas', 30, ([Drawing.FontStyle]::Bold), 'Pixel'
$monoSmall = New-Object Drawing.Font 'Consolas', 22, ([Drawing.FontStyle]::Regular), 'Pixel'
$title = New-Object Drawing.Font 'Segoe UI', 84, ([Drawing.FontStyle]::Bold), 'Pixel'
$sub = New-Object Drawing.Font 'Segoe UI', 27, ([Drawing.FontStyle]::Regular), 'Pixel'
$white = [Drawing.Brushes]::WhiteSmoke
$grey = New-Object Drawing.SolidBrush ([Drawing.Color]::FromArgb(0xB4, 0xB8, 0xBE))
$ybrush = New-Object Drawing.SolidBrush $yellow

# ---- social preview 1280x640 ----
$bmp, $g = New-Canvas 1280 640
Draw-Right $g $editor 660 620 640
$g.FillRectangle($ybrush, 64, 150, 12, 320)
$g.DrawString('talkdedsec-code', $mono, $ybrush, 100, 140)
$g.DrawString('Talkdedsec', $title, $white, 92, 210)
$g.DrawString("Telemetry-free code editor", $sub, $grey, 100, 340)
$g.DrawString("Windows · Open VSX · TR/EN", $sub, $grey, 100, 378)
$g.DrawString('github.com/Talkdedsec/talkdedsec-code', $monoSmall, $ybrush, 100, 540)
$g.Dispose()
New-Item -ItemType Directory -Force (Split-Path $Social) | Out-Null
$bmp.Save($Social, [Drawing.Imaging.ImageFormat]::Png); $bmp.Dispose()

# ---- README banner 1280x420: the classic eye on the right ----
$bmp, $g = New-Canvas 1280 420
$logo = [Drawing.Image]::FromFile((Resolve-Path "$PSScriptRoot\..\logo.png").Path)
$g.DrawImage($logo, [Drawing.Rectangle]::new(740, -40, 500, 500), [Drawing.Rectangle]::new(63, 67, 880, 880), 'Pixel')
$g.FillRectangle($ybrush, 64, 100, 12, 220)
$g.DrawString('talkdedsec-code', $mono, $ybrush, 100, 92)
$g.DrawString('Talkdedsec', $title, $white, 92, 150)
$g.DrawString('A code editor that answers to you.', $sub, $grey, 100, 276)
$g.Dispose(); $logo.Dispose()
$bmp.Save("$Out\banner.png", [Drawing.Imaging.ImageFormat]::Png); $bmp.Dispose()

$editor.Dispose(); $setupBmp.Dispose()
Get-ChildItem $Out, $Social | ForEach-Object { "{0,-24} {1,6:N0} KB" -f $_.Name, ($_.Length / 1KB) }
