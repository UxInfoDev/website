if (!(Test-Path "C:\Temp\uxinfotech-publish")) {
    New-Item -ItemType Directory -Force -Path "C:\Temp\uxinfotech-publish"
}
Remove-Item -Recurse -Force "C:\Temp\uxinfotech-publish\*" -ErrorAction SilentlyContinue

# Copy everything EXCEPT public/uploads (to preserve production-uploaded files)
$items = @("dist", "dist-admin", "server.js", "package.json", "package-lock.json", ".env", "init.sql")
foreach ($item in $items) {
    if (Test-Path ".\$item") {
        Copy-Item -Recurse -Force ".\$item" "C:\Temp\uxinfotech-publish\"
    }
}

# Copy public folder but EXCLUDE uploads subdirectory
New-Item -ItemType Directory -Force -Path "C:\Temp\uxinfotech-publish\public" | Out-Null
Get-ChildItem ".\public" -Exclude "uploads" | Copy-Item -Recurse -Force -Destination "C:\Temp\uxinfotech-publish\public\"

Write-Host "Files copied to C:\Temp\uxinfotech-publish (uploads excluded to preserve production files)"
