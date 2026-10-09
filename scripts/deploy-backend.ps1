# Deploy a panel backend to Cloud Run from the monorepo root.
# Usage (from repo root):
#   .\scripts\deploy-backend.ps1 admin
#   .\scripts\deploy-backend.ps1 hr
#   .\scripts\deploy-backend.ps1 guard
param(
  [Parameter(Mandatory = $true)]
  [ValidateSet("admin", "hr", "super-admin", "guard")]
  [string]$Panel,

  [string]$ProjectId = $(if ($env:GCP_PROJECT_ID) { $env:GCP_PROJECT_ID } else { "app-raksha" }),
  [string]$Region = $(if ($env:GCP_REGION) { $env:GCP_REGION } else { "asia-south1" }),
  [string]$Repo = $(if ($env:ARTIFACT_REPO) { $env:ARTIFACT_REPO } else { "raskha-backends" })
)

$ErrorActionPreference = "Continue"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

switch ($Panel) {
  "admin" {
    $Service = "raskha-admin-api"
    $Dockerfile = "Panels/Admin Panel/backend/Dockerfile"
  }
  "hr" {
    $Service = "raskha-hr-api"
    $Dockerfile = "Panels/HR Panel/backend/Dockerfile"
  }
  "super-admin" {
    $Service = "raskha-super-admin-api"
    $Dockerfile = "Panels/Super Admin Panel/backend/Dockerfile"
  }
  "guard" {
    $Service = "raskha-guard-app-api"
    $Dockerfile = "Panels/Guard Panel/guard app backend/Dockerfile"
  }
}

if (-not (Test-Path ".env")) {
  throw "Missing .env at repo root (needed for Firebase env vars)."
}

# Load selected env keys into this process (values not echoed)
Get-Content ".env" | ForEach-Object {
  if ($_ -match '^\s*#' -or $_ -match '^\s*$') { return }
  $parts = $_.Split("=", 2)
  if ($parts.Length -ne 2) { return }
  $key = $parts[0].Trim()
  $val = $parts[1].Trim().Trim('"').Trim("'")
  if ($key -match '^(FIREBASE_|CORS_ALLOWED_ORIGINS$|SUPER_ADMIN_|GUARD_|ATTENDANCE_)') {
    Set-Item -Path "Env:$key" -Value $val
  }
}

foreach ($required in @(
  "FIREBASE_API_KEY",
  "FIREBASE_AUTH_DOMAIN",
  "FIREBASE_PROJECT_ID",
  "FIREBASE_STORAGE_BUCKET",
  "FIREBASE_MESSAGING_SENDER_ID",
  "FIREBASE_APP_ID"
)) {
  $val = [Environment]::GetEnvironmentVariable($required)
  if ([string]::IsNullOrWhiteSpace($val)) {
    throw "Missing $required in .env"
  }
}

if ($Panel -eq "super-admin" -or $Panel -eq "guard") {
  foreach ($required in @("FIREBASE_CLIENT_EMAIL", "FIREBASE_PRIVATE_KEY")) {
    $val = [Environment]::GetEnvironmentVariable($required)
    if ([string]::IsNullOrWhiteSpace($val)) {
      throw "Missing $required in .env (required for $Panel API)"
    }
  }
}

if ($Panel -eq "super-admin") {
  $saKey = [Environment]::GetEnvironmentVariable("SUPER_ADMIN_API_KEY")
  if ([string]::IsNullOrWhiteSpace($saKey)) {
    throw "Missing SUPER_ADMIN_API_KEY in .env (required for Super Admin API)"
  }
}

$Image = "$Region-docker.pkg.dev/$ProjectId/$Repo/${Service}:latest"

Write-Host "Ensuring Artifact Registry repo '$Repo' in $Region..."
gcloud artifacts repositories describe $Repo --location=$Region --project=$ProjectId 1>$null 2>$null
if ($LASTEXITCODE -ne 0) {
  gcloud artifacts repositories create $Repo `
    --repository-format=docker `
    --location=$Region `
    --project=$ProjectId `
    --description="Raskha panel backends"
  if ($LASTEXITCODE -ne 0) { throw "Failed to create Artifact Registry repo" }
}

$cloudbuild = @"
steps:
  - name: gcr.io/cloud-builders/docker
    args: ['build', '-f', '$Dockerfile', '-t', '$Image', '.']
images:
  - $Image
options:
  logging: CLOUD_LOGGING_ONLY
timeout: 1200s
"@

$tmp = Join-Path $env:TEMP "raskha-cloudbuild-$Panel.yaml"
# UTF-8 without BOM (Cloud Build rejects BOM)
$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText($tmp, $cloudbuild, $utf8NoBom)

Write-Host "Building and pushing $Image ..."
gcloud builds submit --project=$ProjectId --config=$tmp --timeout=1200
if ($LASTEXITCODE -ne 0) { throw "Cloud Build failed" }

$envVars = @(
  "FIREBASE_API_KEY=$($env:FIREBASE_API_KEY)",
  "FIREBASE_AUTH_DOMAIN=$($env:FIREBASE_AUTH_DOMAIN)",
  "FIREBASE_PROJECT_ID=$($env:FIREBASE_PROJECT_ID)",
  "FIREBASE_STORAGE_BUCKET=$($env:FIREBASE_STORAGE_BUCKET)",
  "FIREBASE_MESSAGING_SENDER_ID=$($env:FIREBASE_MESSAGING_SENDER_ID)",
  "FIREBASE_APP_ID=$($env:FIREBASE_APP_ID)"
)

if ($Panel -eq "super-admin") {
  $envVars += @(
    "FIREBASE_CLIENT_EMAIL=$($env:FIREBASE_CLIENT_EMAIL)",
    "FIREBASE_PRIVATE_KEY=$($env:FIREBASE_PRIVATE_KEY)",
    "SUPER_ADMIN_API_KEY=$($env:SUPER_ADMIN_API_KEY)",
    "SUPER_ADMIN_EMAILS=$($env:SUPER_ADMIN_EMAILS)",
    "SUPER_ADMIN_NOTIFY_EMAIL=$($env:SUPER_ADMIN_NOTIFY_EMAIL)",
    "SUPER_ADMIN_OTP_DEBUG=$($env:SUPER_ADMIN_OTP_DEBUG)"
  )
}

# Admin / HR backends need Admin SDK credentials (env-vars-file replaces all vars).
if ($Panel -eq "admin" -or $Panel -eq "hr") {
  $envVars += @(
    "FIREBASE_CLIENT_EMAIL=$($env:FIREBASE_CLIENT_EMAIL)",
    "FIREBASE_PRIVATE_KEY=$($env:FIREBASE_PRIVATE_KEY)"
  )
  if ($env:CORS_ALLOWED_ORIGINS) {
    $envVars += "CORS_ALLOWED_ORIGINS=$($env:CORS_ALLOWED_ORIGINS)"
  }
}

if ($Panel -eq "guard") {
  $envVars += @(
    "FIREBASE_CLIENT_EMAIL=$($env:FIREBASE_CLIENT_EMAIL)",
    "FIREBASE_PRIVATE_KEY=$($env:FIREBASE_PRIVATE_KEY)",
    "ATTENDANCE_DEMO_MODE=$(if ($env:ATTENDANCE_DEMO_MODE) { $env:ATTENDANCE_DEMO_MODE } else { 'true' })",
    "GUARD_DEMO_ID=$(if ($env:GUARD_DEMO_ID) { $env:GUARD_DEMO_ID } else { 'RKS-8842' })",
    "GUARD_DEMO_PASSWORD=$(if ($env:GUARD_DEMO_PASSWORD) { $env:GUARD_DEMO_PASSWORD } else { 'demo1234' })",
    "GUARD_DEMO_PHONE=$(if ($env:GUARD_DEMO_PHONE) { $env:GUARD_DEMO_PHONE } else { '9876543210' })",
    "GUARD_OTP_DEBUG=$(if ($env:GUARD_OTP_DEBUG) { $env:GUARD_OTP_DEBUG } else { 'false' })",
    "SELFIE_UPLOAD_CONCURRENCY=$(if ($env:SELFIE_UPLOAD_CONCURRENCY) { $env:SELFIE_UPLOAD_CONCURRENCY } else { '20' })",
    "LOAD_TEST_ALLOW_MULTI_PUNCH=$(if ($env:LOAD_TEST_ALLOW_MULTI_PUNCH) { $env:LOAD_TEST_ALLOW_MULTI_PUNCH } else { 'false' })"
  )
  if ($env:GUARD_DEMO_SITE_ID) {
    $envVars += "GUARD_DEMO_SITE_ID=$($env:GUARD_DEMO_SITE_ID)"
  }
  if ($env:CORS_ALLOWED_ORIGINS) {
    $envVars += "CORS_ALLOWED_ORIGINS=$($env:CORS_ALLOWED_ORIGINS)"
  }
}

# Private keys / multi-value envs are safer via a YAML file than --set-env-vars CSV
$envFile = Join-Path $env:TEMP "raskha-cloudrun-env-$Panel.yaml"
$envYaml = ($envVars | ForEach-Object {
  $pair = $_.Split("=", 2)
  $k = $pair[0]
  $v = if ($pair.Length -eq 2) { $pair[1] } else { "" }
  # YAML double-quoted string escapes
  $escaped = $v.Replace('\', '\\').Replace('"', '\"')
  "${k}: `"${escaped}`""
}) -join "`n"
[System.IO.File]::WriteAllText($envFile, $envYaml + "`n", $utf8NoBom)

# Guard morning-rush: warm instance, 2 CPU, higher concurrency for signed-URL + light JSON
$Memory = "512Mi"
$Cpu = "1"
$MinInstances = 0
$MaxInstances = 5
$Concurrency = 80
if ($Panel -eq "guard") {
  $Memory = "1Gi"
  $Cpu = "2"
  $MinInstances = 1
  $MaxInstances = 20
  $Concurrency = 80
}

Write-Host "Deploying Cloud Run service $Service (memory=$Memory cpu=$Cpu min=$MinInstances max=$MaxInstances concurrency=$Concurrency) ..."
gcloud run deploy $Service `
  --project=$ProjectId `
  --image=$Image `
  --region=$Region `
  --platform=managed `
  --allow-unauthenticated `
  --port=8080 `
  --memory=$Memory `
  --cpu=$Cpu `
  --min-instances=$MinInstances `
  --max-instances=$MaxInstances `
  --concurrency=$Concurrency `
  --env-vars-file=$envFile
if ($LASTEXITCODE -ne 0) { throw "Cloud Run deploy failed" }

$url = gcloud run services describe $Service `
  --project=$ProjectId `
  --region=$Region `
  --format="value(status.url)"

Write-Host ""
Write-Host "Deployed $Service -> $url"
Write-Host "Health: $url/health"
