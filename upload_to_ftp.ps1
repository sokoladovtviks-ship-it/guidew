# FTP Upload Script
$ftpServer = "77.222.40.198"
$ftpUsername = "sokoladovt"
$ftpPassword = "Wiks6500"

Write-Host "Testing FTP connection..." -ForegroundColor Yellow

try {
    $ftpRequest = [System.Net.FtpWebRequest]::Create("ftp://$ftpServer/")
    $ftpRequest.Method = [System.Net.WebRequestMethods+Ftp]::ListDirectory
    $ftpRequest.Credentials = New-Object System.Net.NetworkCredential($ftpUsername, $ftpPassword)
    
    $response = $ftpRequest.GetResponse()
    $streamReader = New-Object System.IO.StreamReader($response.GetResponseStream())
    $directories = $streamReader.ReadToEnd()
    $streamReader.Close()
    $response.Close()
    
    Write-Host "SUCCESS: FTP connection works!" -ForegroundColor Green
    Write-Host "Root directory contents:" -ForegroundColor Cyan
    Write-Host $directories
}
catch {
    Write-Host "ERROR: FTP connection failed: $($_.Exception.Message)" -ForegroundColor Red
    
    Write-Host "Trying alternative usernames..." -ForegroundColor Yellow
    
    $alternativeUsernames = @(
        "sokoladovt@rdp-onedash.ru",
        "sokoladovt@77.222.40.198"
    )
    
    foreach ($altUser in $alternativeUsernames) {
        Write-Host "Trying: $altUser" -ForegroundColor Cyan
        try {
            $ftpRequest = [System.Net.FtpWebRequest]::Create("ftp://$ftpServer/")
            $ftpRequest.Method = [System.Net.WebRequestMethods+Ftp]::ListDirectory
            $ftpRequest.Credentials = New-Object System.Net.NetworkCredential($altUser, $ftpPassword)
            
            $response = $ftpRequest.GetResponse()
            Write-Host "SUCCESS with: $altUser" -ForegroundColor Green
            $response.Close()
            break
        }
        catch {
            Write-Host "FAILED: $altUser" -ForegroundColor Red
        }
    }
}
