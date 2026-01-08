# Script to copy Minam and Syuzhet logos to frontend/public
# Run this from the yoree root directory

Write-Host "Copying logos to frontend/public..."

# Copy Minam logo
if (Test-Path "minam\apps\web\public\james-dean-logo.png") {
    Copy-Item "minam\apps\web\public\james-dean-logo.png" -Destination "frontend\public\minam-logo.png" -Force
    Write-Host "✓ Copied Minam logo successfully"
} else {
    Write-Host "✗ Minam logo not found at: minam\apps\web\public\james-dean-logo.png"
    Write-Host "  Please check if the minam submodule is initialized or the path is correct"
}

# Copy Syuzhet logo
if (Test-Path "syuzhet\public\Saylor.png") {
    Copy-Item "syuzhet\public\Saylor.png" -Destination "frontend\public\syuzhet-logo.png" -Force
    Write-Host "✓ Copied Syuzhet logo successfully"
} else {
    Write-Host "✗ Syuzhet logo not found at: syuzhet\public\Saylor.png"
    Write-Host "  Please check if the syuzhet submodule is initialized or the path is correct"
}

Write-Host "`nLogo copy process complete!"
Write-Host "If logos were not found, you may need to:"
Write-Host "1. Initialize git submodules: git submodule update --init --recursive"
Write-Host "2. Or manually copy the logo files to frontend/public/"
Write-Host "   - minam-logo.png (from minam/apps/web/public/james-dean-logo.png)"
Write-Host "   - syuzhet-logo.png (from syuzhet/public/Saylor.png)"
