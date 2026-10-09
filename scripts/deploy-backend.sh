#!/usr/bin/env bash
# Deploy a panel backend to Cloud Run from the monorepo root.
# Usage:
#   ./scripts/deploy-backend.sh admin
#   ./scripts/deploy-backend.sh hr
#   ./scripts/deploy-backend.sh guard
set -euo pipefail

PANEL="${1:-}"
PROJECT_ID="${GCP_PROJECT_ID:-app-raksha}"
REGION="${GCP_REGION:-asia-south1}"
REPO="${ARTIFACT_REPO:-raskha-backends}"

case "$PANEL" in
  admin)
    SERVICE="raskha-admin-api"
    DOCKERFILE="Panels/Admin Panel/backend/Dockerfile"
    ;;
  hr)
    SERVICE="raskha-hr-api"
    DOCKERFILE="Panels/HR Panel/backend/Dockerfile"
    ;;
  super-admin)
    SERVICE="raskha-super-admin-api"
    DOCKERFILE="Panels/Super Admin Panel/backend/Dockerfile"
    ;;
  guard)
    SERVICE="raskha-guard-app-api"
    DOCKERFILE="Panels/Guard Panel/guard app backend/Dockerfile"
    ;;
  *)
    echo "Usage: $0 <admin|hr|super-admin|guard>"
    exit 1
    ;;
esac

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ ! -f .env ]]; then
  echo "Missing .env at repo root (needed for Firebase env vars)."
  exit 1
fi

# Load Firebase keys for Cloud Run without printing values
set -a
# shellcheck disable=SC1091
source <(grep -E '^(FIREBASE_|CORS_ALLOWED_ORIGINS=)' .env | sed 's/\r$//')
set +a

IMAGE="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO}/${SERVICE}:latest"

gcloud artifacts repositories describe "$REPO" \
  --location="$REGION" \
  --project="$PROJECT_ID" >/dev/null 2>&1 \
  || gcloud artifacts repositories create "$REPO" \
      --repository-format=docker \
      --location="$REGION" \
      --project="$PROJECT_ID" \
      --description="Raskha panel backends"

gcloud builds submit \
  --project="$PROJECT_ID" \
  --tag="$IMAGE" \
  --gcs-log-dir="gs://${PROJECT_ID}_cloudbuild/logs" \
  --timeout=1200 \
  --config=/dev/stdin <<EOF
steps:
  - name: gcr.io/cloud-builders/docker
    args:
      - build
      - -f
      - ${DOCKERFILE}
      - -t
      - ${IMAGE}
      - .
images:
  - ${IMAGE}
EOF

MEMORY="512Mi"
CPU="1"
MIN_INSTANCES=0
MAX_INSTANCES=5
CONCURRENCY=80
GUARD_EXTRA_ENV=""
if [[ "$PANEL" == "guard" ]]; then
  MEMORY="1Gi"
  CPU="2"
  MIN_INSTANCES=1
  MAX_INSTANCES=20
  CONCURRENCY=80
  GUARD_EXTRA_ENV=",SELFIE_UPLOAD_CONCURRENCY=${SELFIE_UPLOAD_CONCURRENCY:-20},LOAD_TEST_ALLOW_MULTI_PUNCH=${LOAD_TEST_ALLOW_MULTI_PUNCH:-false}"
fi

echo "Deploying $SERVICE (memory=$MEMORY cpu=$CPU min=$MIN_INSTANCES max=$MAX_INSTANCES concurrency=$CONCURRENCY) ..."

gcloud run deploy "$SERVICE" \
  --project="$PROJECT_ID" \
  --image="$IMAGE" \
  --region="$REGION" \
  --platform=managed \
  --allow-unauthenticated \
  --port=8080 \
  --memory="$MEMORY" \
  --cpu="$CPU" \
  --min-instances="$MIN_INSTANCES" \
  --max-instances="$MAX_INSTANCES" \
  --concurrency="$CONCURRENCY" \
  --set-env-vars="FIREBASE_API_KEY=${FIREBASE_API_KEY},FIREBASE_AUTH_DOMAIN=${FIREBASE_AUTH_DOMAIN},FIREBASE_PROJECT_ID=${FIREBASE_PROJECT_ID},FIREBASE_STORAGE_BUCKET=${FIREBASE_STORAGE_BUCKET},FIREBASE_MESSAGING_SENDER_ID=${FIREBASE_MESSAGING_SENDER_ID},FIREBASE_APP_ID=${FIREBASE_APP_ID}${GUARD_EXTRA_ENV}"

gcloud run services describe "$SERVICE" \
  --project="$PROJECT_ID" \
  --region="$REGION" \
  --format='value(status.url)'
