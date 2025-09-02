# PowerShell script to convert Firebase service account key to Base64
# Usage: .\convert-key.ps1 path\to\your\service-account-key.json

param(
    [Parameter(Mandatory=$true)]
    [string]$JsonFilePath
)

if (Test-Path $JsonFilePath) {
    $content = Get-Content $JsonFilePath -Raw
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($content)
    $base64 = [System.Convert]::ToBase64String($bytes)
    
    Write-Host "Base64 encoded service account key:"
    Write-Host "=================================="
    Write-Host $base64
    Write-Host "=================================="
    Write-Host "Copy this entire string and paste it as the FIREBASE_SERVICE_ACCOUNT_KEY environment variable in Vercel"
} else {
    Write-Host "File not found: $JsonFilePath"
}
