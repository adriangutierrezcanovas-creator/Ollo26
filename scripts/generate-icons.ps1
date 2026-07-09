Add-Type -AssemblyName System.Drawing

function New-OlloIcon {
    param(
        [int]$Size,
        [string]$OutPath,
        [bool]$Maskable
    )

    $bmp = New-Object System.Drawing.Bitmap($Size, $Size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

    $bgColor = [System.Drawing.Color]::FromArgb(255, 217, 119, 87)   # coral de la app
    $g.Clear($bgColor)

    # Zona segura más amplia para iconos "maskable" (los sistemas recortan un círculo/redondeado).
    $pad = if ($Maskable) { [double]$Size * 0.18 } else { [double]$Size * 0.14 }
    $contentW = [double]$Size - ($pad * 2)
    $contentH = [double]$Size - ($pad * 2)

    $fontFamily = "Segoe UI"
    $bigSize = $contentH * 0.62      # altura aprox. de las L (montañas)
    $smallSize = $contentH * 0.34    # altura aprox. de las O (valles)

    $fontBig = New-Object System.Drawing.Font($fontFamily, $bigSize, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
    $fontSmall = New-Object System.Drawing.Font($fontFamily, $smallSize, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
    $brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)

    $letters = @(
        @{ Char = "O"; Font = $fontSmall },
        @{ Char = "L"; Font = $fontBig },
        @{ Char = "L"; Font = $fontBig },
        @{ Char = "O"; Font = $fontSmall }
    )

    $spacing = $Size * 0.012
    $sizes = @()
    $totalW = 0.0
    foreach ($l in $letters) {
        $sz = $g.MeasureString($l.Char, $l.Font, 9999, [System.Drawing.StringFormat]::GenericTypographic)
        $sizes += $sz
        $totalW += $sz.Width
    }
    $totalW += $spacing * ($letters.Count - 1)

    $baselineY = $pad + $contentH * 0.86   # línea base compartida (todas las letras se apoyan aquí)
    $x = $pad + ($contentW - $totalW) / 2.0

    for ($i = 0; $i -lt $letters.Count; $i++) {
        $l = $letters[$i]
        $sz = $sizes[$i]
        $y = $baselineY - $sz.Height
        $g.DrawString($l.Char, $l.Font, $brush, [single]$x, [single]$y, [System.Drawing.StringFormat]::GenericTypographic)
        $x += $sz.Width + $spacing
    }

    $bmp.Save($OutPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $fontBig.Dispose(); $fontSmall.Dispose(); $brush.Dispose()
    $g.Dispose(); $bmp.Dispose()
}

$iconDir = "E:\APP VIAJE\App_Viaje\assets\icons"
New-OlloIcon -Size 192 -OutPath "$iconDir\icon-192.png" -Maskable $false
New-OlloIcon -Size 512 -OutPath "$iconDir\icon-512.png" -Maskable $false
New-OlloIcon -Size 192 -OutPath "$iconDir\icon-192-maskable.png" -Maskable $true
New-OlloIcon -Size 512 -OutPath "$iconDir\icon-512-maskable.png" -Maskable $true
New-OlloIcon -Size 32 -OutPath "$iconDir\favicon-32.png" -Maskable $false

Write-Output "Icons generated in $iconDir"
