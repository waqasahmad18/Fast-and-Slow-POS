$ErrorActionPreference = "Stop"

$root = "D:\mongodb"
$mongod = Join-Path $root "bin\mongod.exe"
$data = Join-Path $root "data"
$logDir = Join-Path $root "log"
$log = Join-Path $logDir "mongod.log"

if (-not (Test-Path $mongod)) {
  Write-Error "MongoDB is not installed at $mongod"
  exit 1
}

New-Item -ItemType Directory -Force -Path $data, $logDir | Out-Null

$busy = Get-NetTCPConnection -LocalPort 27017 -State Listen -ErrorAction SilentlyContinue
if ($busy) {
  Write-Host "MongoDB already listening on port 27017"
  exit 0
}

Start-Process -FilePath $mongod -ArgumentList @(
  "--dbpath", $data,
  "--logpath", $log,
  "--bind_ip", "127.0.0.1",
  "--port", "27017"
) -WindowStyle Hidden

for ($i = 0; $i -lt 20; $i++) {
  Start-Sleep -Milliseconds 400
  $ready = Get-NetTCPConnection -LocalPort 27017 -State Listen -ErrorAction SilentlyContinue
  if ($ready) {
    Write-Host "MongoDB started on mongodb://127.0.0.1:27017"
    exit 0
  }
}

Write-Error "MongoDB did not start. Check $log"
exit 1
