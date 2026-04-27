if (!(Test-Path "C:\Temp\uxinfotech-publish")) {
    New-Item -ItemType Directory -Force -Path "C:\Temp\uxinfotech-publish"
}
Remove-Item -Recurse -Force "C:\Temp\uxinfotech-publish\*" -ErrorAction SilentlyContinue

$items = @("dist", "dist-admin", "public", "server.js", "package.json", "package-lock.json", ".env")
foreach ($item in $items) {
    Copy-Item -Recurse -Force ".\$item" "C:\Temp\uxinfotech-publish\"
}
Write-Host "Files copied to C:\Temp\uxinfotech-publish"
