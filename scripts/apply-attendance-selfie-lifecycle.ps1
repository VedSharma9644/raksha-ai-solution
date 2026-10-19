# Apply GCS Object Lifecycle: delete attendance selfies older than 120 days (~4 months).
# Only objects under attendance/ are affected — profile pics, docs, and Firestore are untouched.
#
# Usage (from repo root):
#   .\scripts\apply-attendance-selfie-lifecycle.ps1
#   .\scripts\apply-attendance-selfie-lifecycle.ps1 -Bucket app-raksha.firebasestorage.app
param(
  [string]$ProjectId = $(if ($env:GCP_PROJECT_ID) { $env:GCP_PROJECT_ID } else { "app-raksha" }),
  [string]$Bucket = ""
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

if (-not $Bucket) {
  if (Test-Path ".env") {
    $line = Get-Content ".env" | Where-Object { $_ -match '^\s*FIREBASE_STORAGE_BUCKET\s*=' } | Select-Object -First 1
    if ($line) {
      $Bucket = ($line -split "=", 2)[1].Trim().Trim('"').Trim("'")
    }
  }
}
if (-not $Bucket) {
  throw "Pass -Bucket or set FIREBASE_STORAGE_BUCKET in .env"
}

$LifecycleFile = Join-Path $PSScriptRoot "storage\attendance-selfie-lifecycle.json"
if (-not (Test-Path $LifecycleFile)) {
  throw "Missing lifecycle file: $LifecycleFile"
}

Write-Host "Applying attendance selfie lifecycle (delete age>=120d under attendance/) to gs://$Bucket ..."
gcloud storage buckets update "gs://$Bucket" `
  --project=$ProjectId `
  --lifecycle-file=$LifecycleFile
if ($LASTEXITCODE -ne 0) { throw "Failed to update bucket lifecycle" }

Write-Host ""
Write-Host "Done. Verify with:"
Write-Host "  gcloud storage buckets describe gs://$Bucket --format=`"json(lifecycle)`""
Write-Host ""
Write-Host "Notes:"
Write-Host "  - Firestore attendance records (times, geofence, status) are NOT deleted."
Write-Host "  - Only Storage objects under attendance/ older than 120 days are removed."
Write-Host "  - Profile pictures and HR docs under other prefixes are unchanged."
