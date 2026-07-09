Add-Type -AssemblyName System.Drawing

function New-AppIcon {
    param(
        [int]$Size,
        [string]$OutPath,
        [bool]$Maskable
    )

    $bmp = New-Object System.Drawing.Bitmap($Size, $Size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias

    $bgColor = [System.Drawing.Color]::FromArgb(255, 217, 119, 87)   # Claude coral/terracota
    $g.Clear($bgColor)

    # Safe zone padding for maskable icons (~10% each side)
    $pad = if ($Maskable) { [int]($Size * 0.12) } else { [int]($Size * 0.04) }
    $w = $Size - ($pad * 2)
    $h = $Size - ($pad * 2)

    # Sun
    $sunColor = [System.Drawing.Color]::FromArgb(255, 245, 199, 84)
    $sunBrush = New-Object System.Drawing.SolidBrush($sunColor)
    $sunSize = [int]($w * 0.28)
    $sunX = $pad + [int]($w * 0.62)
    $sunY = $pad + [int]($h * 0.12)
    $g.FillEllipse($sunBrush, $sunX, $sunY, $sunSize, $sunSize)

    # Mountain (two overlapping triangles)
    $mtnColor = [System.Drawing.Color]::FromArgb(255, 255, 255, 255)
    $mtnBrush = New-Object System.Drawing.SolidBrush($mtnColor)

    $baseY = $pad + [int]($h * 0.78)
    $p1 = New-Object System.Drawing.Point(($pad + [int]($w * 0.08)), $baseY)
    $p2 = New-Object System.Drawing.Point(($pad + [int]($w * 0.42)), ($pad + [int]($h * 0.32)))
    $p3 = New-Object System.Drawing.Point(($pad + [int]($w * 0.66)), ($pad + [int]($h * 0.58)))
    $g.FillPolygon($mtnBrush, @($p1, $p2, $p3, (New-Object System.Drawing.Point(($pad + [int]($w*0.08)), $baseY))))

    $mtn2Color = [System.Drawing.Color]::FromArgb(255, 245, 228, 216)
    $mtn2Brush = New-Object System.Drawing.SolidBrush($mtn2Color)
    $q1 = New-Object System.Drawing.Point(($pad + [int]($w * 0.38)), $baseY)
    $q2 = New-Object System.Drawing.Point(($pad + [int]($w * 0.68)), ($pad + [int]($h * 0.22)))
    $q3 = New-Object System.Drawing.Point(($pad + [int]($w * 0.95)), $baseY)
    $g.FillPolygon($mtn2Brush, @($q1, $q2, $q3))

    $bmp.Save($OutPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
}

$iconDir = "E:\APP VIAJE\App_Viaje\assets\icons"
New-AppIcon -Size 192 -OutPath "$iconDir\icon-192.png" -Maskable $false
New-AppIcon -Size 512 -OutPath "$iconDir\icon-512.png" -Maskable $false
New-AppIcon -Size 192 -OutPath "$iconDir\icon-192-maskable.png" -Maskable $true
New-AppIcon -Size 512 -OutPath "$iconDir\icon-512-maskable.png" -Maskable $true
New-AppIcon -Size 32 -OutPath "$iconDir\favicon-32.png" -Maskable $false

Write-Output "Icons generated in $iconDir"
