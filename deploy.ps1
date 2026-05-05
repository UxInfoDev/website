# ==========================================
# Oracle Cloud VM Deployment Script
# ==========================================

# 1. Configuration
$publishDir = "C:\Temp\uxinfotech-publish"
$sshKey = "$HOME\Downloads\ssh-key-2026-03-28.key"
$remoteUser = "ubuntu"
$remoteHost = "129.153.51.230"

# Change these two variables if your project is hosted in a different folder or has a different PM2 name
$remoteAppDir = "/home/ubuntu"       # Files live directly here (no subfolder)
$pm2AppName = "uxinfotech-backend"    # Actual PM2 process name on the server

# 2. Setup Variables
$timestamp = Get-Date -Format "yyyyMMdd_HHmm"
$zipFile = "C:\Temp\deploy_${timestamp}.zip"
$backupDir = "${remoteAppDir}_backup_${timestamp}"

Write-Host "==================" -ForegroundColor Cyan
Write-Host "Starting Deployment" -ForegroundColor Cyan
Write-Host "==================" -ForegroundColor Cyan

# 3. Zip the Local Publish Folder (Faster than copying raw files via SCP)
Write-Host "1. Compressing $publishDir into a zip file..." -ForegroundColor Yellow
if (Test-Path $zipFile) { Remove-Item $zipFile -Force }
Compress-Archive -Path "$publishDir\*" -DestinationPath $zipFile -Force

# 4. Take Backup of Remote Server Directory
Write-Host "2. Connecting via SSH to take a remote backup of $remoteAppDir..." -ForegroundColor Yellow
$backupCmd = "if [ -d ""$remoteAppDir"" ]; then cp -r ""$remoteAppDir"" ""$backupDir""; echo 'Backup created at $backupDir'; else echo 'App directory not found to backup, skipping...'; fi"
ssh -o StrictHostKeyChecking=no -i $sshKey ${remoteUser}@${remoteHost} $backupCmd

# 5. Upload Zip File to Remote Server
Write-Host "3. Uploading Zip file to the server..." -ForegroundColor Yellow
scp -o StrictHostKeyChecking=no -i $sshKey $zipFile ${remoteUser}@${remoteHost}:/home/ubuntu/deploy.zip

# 6. Extract, Install Dependencies, and Restart PM2 Server
Write-Host "4. Extracting files and restarting Node server..." -ForegroundColor Yellow
$deployCmd = @"
  sudo apt-get install -y unzip
  mkdir -p $remoteAppDir
  cd /home/ubuntu

  # Backup uploads and favicon before overwrite
  if [ -d "$remoteAppDir/public/uploads" ]; then
    cp -r "$remoteAppDir/public/uploads" /tmp/uploads_backup_${timestamp}
  fi
  if [ -f "$remoteAppDir/fevicon.png" ]; then
    cp "$remoteAppDir/fevicon.png" /tmp/fevicon_backup_${timestamp}
  elif [ -f "$remoteAppDir/dist/fevicon.png" ]; then
    cp "$remoteAppDir/dist/fevicon.png" /tmp/fevicon_backup_${timestamp}
  fi

  unzip -o deploy.zip -d $remoteAppDir
  rm deploy.zip

  # Restore uploads and fevicon if they were overwritten
  mkdir -p "$remoteAppDir/public/uploads"
  if [ -d "/tmp/uploads_backup_${timestamp}" ]; then
    cp -rn /tmp/uploads_backup_${timestamp}/. "$remoteAppDir/public/uploads/"
    rm -rf /tmp/uploads_backup_${timestamp}
  fi
  if [ -f "/tmp/fevicon_backup_${timestamp}" ]; then
    cp "/tmp/fevicon_backup_${timestamp}" "$remoteAppDir/fevicon.png"
    cp "/tmp/fevicon_backup_${timestamp}" "$remoteAppDir/dist/fevicon.png"
    cp "/tmp/fevicon_backup_${timestamp}" "$remoteAppDir/public/fevicon.png"
    rm /tmp/fevicon_backup_${timestamp}
  fi

  cd $remoteAppDir
  npm install --production
  pm2 restart $pm2AppName || pm2 start server.js --name $pm2AppName
"@
ssh -i $sshKey ${remoteUser}@${remoteHost} $deployCmd

# 7. Clean up local zip file
Write-Host "5. Cleaning up local files..." -ForegroundColor Yellow
if (Test-Path $zipFile) { Remove-Item $zipFile -Force }

Write-Host "============================" -ForegroundColor Green
Write-Host "Deployment fully completed!!" -ForegroundColor Green
Write-Host "============================" -ForegroundColor Green
