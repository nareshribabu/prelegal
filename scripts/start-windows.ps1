$ErrorActionPreference = "Stop"
Set-Location (Join-Path $PSScriptRoot "..")

docker build -t prelegal .
docker run --rm -d --name prelegal -p 8000:8000 prelegal

Write-Host "Prelegal running at http://localhost:8000"
