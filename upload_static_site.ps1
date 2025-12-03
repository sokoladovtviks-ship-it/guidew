# FTP Upload Script for Static Site
$ftpServer = "77.222.40.198"
$ftpUsername = "sokoladovt"
$ftpPassword = "Wiks6500"
$localFile = ".\static-site\index.html"
$remoteFile = "/index.html"

Write-Host "Uploading static site to FTP..." -ForegroundColor Yellow

function Upload-File {
    param(
        [string]$LocalPath,
        [string]$RemotePath
    )
    
    try {
        $ftpRequest = [System.Net.FtpWebRequest]::Create("ftp://$ftpServer$RemotePath")
        $ftpRequest.Method = [System.Net.WebRequestMethods+Ftp]::UploadFile
        $ftpRequest.Credentials = New-Object System.Net.NetworkCredential($ftpUsername, $ftpPassword)
        $ftpRequest.UseBinary = $true
        $ftpRequest.UsePassive = $true
        $ftpRequest.Proxy = $null
        
        $fileContent = [System.IO.File]::ReadAllBytes($LocalPath)
        $ftpRequest.ContentLength = $fileContent.Length
        
        $requestStream = $ftpRequest.GetRequestStream()
        $requestStream.Write($fileContent, 0, $fileContent.Length)
        $requestStream.Close()
        
        $response = $ftpRequest.GetResponse()
        Write-Host "SUCCESS: Uploaded $LocalPath -> $RemotePath" -ForegroundColor Green
        $response.Close()
        return $true
    }
    catch {
        Write-Host "ERROR: Failed to upload $LocalPath - $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Upload the main HTML file
if (Test-Path $localFile) {
    $result = Upload-File -LocalPath $localFile -RemotePath $remoteFile
    if ($result) {
        Write-Host "`nSite uploaded successfully!" -ForegroundColor Green
        Write-Host "Your site should be available at: http://77.222.40.198" -ForegroundColor Cyan
    }
} else {
    Write-Host "ERROR: Local file not found: $localFile" -ForegroundColor Red
}
