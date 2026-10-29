# Klasik goz logosundan (logo.png) VS Code kaynak agacinin bekledigi ikon dosyalarini uretir.
# Yeni cizim yok: sadece kirpma, olcekleme, koyu zemin ve dosya bicimi donusumu.
param(
    [string]$Logo = "$PSScriptRoot\logo.png",
    [string]$Out = "$PSScriptRoot\icons"
)
Add-Type -AssemblyName System.Drawing
$ErrorActionPreference = 'Stop'
$src = [System.Drawing.Image]::FromFile($Logo)
# icerik kutusu 86,234-920,780 (1000x1000 seffaf tuval); kare kirpma, kenarda nefes payi
$crop = New-Object System.Drawing.Rectangle(63, 67, 880, 880)
$zemin = [System.Drawing.Color]::FromArgb(255, 0x0b, 0x0b, 0x0c)

function New-Canvas($w, $h, $bg) {
    $bmp = New-Object System.Drawing.Bitmap($w, $h, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = 'HighQualityBicubic'; $g.SmoothingMode = 'HighQuality'
    $g.PixelOffsetMode = 'HighQuality'; $g.CompositingQuality = 'HighQuality'
    $g.Clear($bg)
    return $bmp, $g
}
# logoyu w x h tuvale, kisa kenarin $oran'i kadar kare alana ortalar
function Draw-Logo($w, $h, $bg, $oran) {
    $bmp, $g = New-Canvas $w $h $bg
    $s = [int]([math]::Min($w, $h) * $oran)
    $dst = New-Object System.Drawing.Rectangle([int](($w - $s) / 2), [int](($h - $s) / 2), $s, $s)
    $g.DrawImage($src, $dst, $crop, [System.Drawing.GraphicsUnit]::Pixel)
    $g.Dispose()
    return $bmp
}
function Png-Bytes($bmp) { $ms = New-Object System.IO.MemoryStream; $bmp.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png); , $ms.ToArray() }
function Save-Png($bmp, $path) { New-Item -ItemType Directory -Force (Split-Path $path) | Out-Null; $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png); $bmp.Dispose() }
function Save-Ico($sizes, $path) {
    $pngs = foreach ($s in $sizes) { $b = Draw-Logo $s $s ([System.Drawing.Color]::Transparent) 1.0; , (Png-Bytes $b); $b.Dispose() }
    $ms = New-Object System.IO.MemoryStream; $bw = New-Object System.IO.BinaryWriter($ms)
    $bw.Write([uint16]0); $bw.Write([uint16]1); $bw.Write([uint16]$sizes.Count)
    $off = 6 + 16 * $sizes.Count
    for ($i = 0; $i -lt $sizes.Count; $i++) {
        $d = if ($sizes[$i] -ge 256) { 0 } else { $sizes[$i] }
        $bw.Write([byte]$d); $bw.Write([byte]$d); $bw.Write([byte]0); $bw.Write([byte]0)
        $bw.Write([uint16]1); $bw.Write([uint16]32); $bw.Write([uint32]$pngs[$i].Length); $bw.Write([uint32]$off)
        $off += $pngs[$i].Length
    }
    foreach ($p in $pngs) { $bw.Write([byte[]]$p) }
    $bw.Flush(); New-Item -ItemType Directory -Force (Split-Path $path) | Out-Null
    [System.IO.File]::WriteAllBytes($path, $ms.ToArray()); $bw.Dispose()
}
function Save-Icns($path) {
    # PNG gomulu icns: ic08=256, ic09=512, ic10=1024
    $parts = foreach ($e in @(@('ic08', 256), @('ic09', 512), @('ic10', 1024))) {
        $b = Draw-Logo $e[1] $e[1] ([System.Drawing.Color]::Transparent) 1.0; $d = Png-Bytes $b; $b.Dispose()
        , @($e[0], $d)
    }
    $ms = New-Object System.IO.MemoryStream
    $be = { param($n) $x = [BitConverter]::GetBytes([uint32]$n); [Array]::Reverse($x); , $x }
    $total = 8; foreach ($p in $parts) { $total += 8 + $p[1].Length }
    $ms.Write([Text.Encoding]::ASCII.GetBytes('icns'), 0, 4); $t = & $be $total; $ms.Write($t, 0, 4)
    foreach ($p in $parts) {
        $ms.Write([Text.Encoding]::ASCII.GetBytes($p[0]), 0, 4); $l = & $be (8 + $p[1].Length); $ms.Write($l, 0, 4)
        $ms.Write($p[1], 0, $p[1].Length)
    }
    New-Item -ItemType Directory -Force (Split-Path $path) | Out-Null
    [System.IO.File]::WriteAllBytes($path, $ms.ToArray())
}
function Save-Bmp($w, $h, $oran, $path) {
    # Inno 32bpp BMP bekliyor; koyu zemin opak, alfa gerekmez
    $b = Draw-Logo $w $h $zemin $oran
    $rgb = $b.Clone((New-Object System.Drawing.Rectangle(0, 0, $w, $h)), [System.Drawing.Imaging.PixelFormat]::Format32bppRgb)
    New-Item -ItemType Directory -Force (Split-Path $path) | Out-Null
    $rgb.Save($path, [System.Drawing.Imaging.ImageFormat]::Bmp); $rgb.Dispose(); $b.Dispose()
}
function Save-Svg($size, $path) {
    $b = Draw-Logo $size $size ([System.Drawing.Color]::Transparent) 1.0; $d = [Convert]::ToBase64String((Png-Bytes $b)); $b.Dispose()
    $svg = "<svg xmlns=`"http://www.w3.org/2000/svg`" xmlns:xlink=`"http://www.w3.org/1999/xlink`" width=`"$size`" height=`"$size`" viewBox=`"0 0 $size $size`"><image width=`"$size`" height=`"$size`" xlink:href=`"data:image/png;base64,$d`"/></svg>"
    New-Item -ItemType Directory -Force (Split-Path $path) | Out-Null
    [System.IO.File]::WriteAllText($path, $svg, (New-Object System.Text.UTF8Encoding($false)))
}

$t = [System.Drawing.Color]::Transparent
Save-Ico @(16, 24, 32, 48, 64, 128, 256) "$Out\win32\code.ico"
Save-Ico @(16, 32, 48, 64, 128, 256) "$Out\server\favicon.ico"
Save-Png (Draw-Logo 70 70 $t 1.0) "$Out\win32\code_70x70.png"
Save-Png (Draw-Logo 150 150 $t 1.0) "$Out\win32\code_150x150.png"
Save-Png (Draw-Logo 512 512 $t 1.0) "$Out\linux\code.png"
Save-Png (Draw-Logo 192 192 $t 1.0) "$Out\server\code-192.png"
Save-Png (Draw-Logo 512 512 $t 1.0) "$Out\server\code-512.png"
Save-Icns "$Out\darwin\code.icns"
$big = @{100 = @(164, 314); 125 = @(192, 386); 150 = @(246, 459); 175 = @(273, 556); 200 = @(328, 604); 225 = @(355, 700); 250 = @(410, 797) }
$small = @{100 = @(55, 55); 125 = @(64, 68); 150 = @(83, 80); 175 = @(92, 97); 200 = @(110, 106); 225 = @(119, 123); 250 = @(138, 140) }
foreach ($k in $big.Keys) { Save-Bmp $big[$k][0] $big[$k][1] 0.9 "$Out\win32\inno-big-$k.bmp" }
foreach ($k in $small.Keys) { Save-Bmp $small[$k][0] $small[$k][1] 0.95 "$Out\win32\inno-small-$k.bmp" }
Save-Svg 128 "$Out\svg\logo.svg"
$src.Dispose()
Get-ChildItem $Out -Recurse -File | ForEach-Object { "{0,-28} {1,7:N1} KB" -f $_.FullName.Substring($Out.Length + 1), ($_.Length / 1KB) }
