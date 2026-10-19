#!/usr/bin/env bash
# Apply GCS Object Lifecycle: delete attendance selfies older than 120 days (~4 months).
# Only objects under attendance/ are affected.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

PROJECT_ID="${GCP_PROJECT_ID:-app-raksha}"
BUCKET="${1:-}"
if [[ -z "$BUCKET" && -f .env ]]; then
  BUCKET="$(grep -E '^\s*FIREBASE_STORAGE_BUCKET\s*=' .env | head -1 | cut -d= -f2- | tr -d ' \"')"
fi
if [[ -z "$BUCKET" ]]; then
  echo "Usage: $0 [bucket-name]  (or set FIREBASE_STORAGE_BUCKET in .env)" >&2
  exit 1
fi

LIFECYCLE="$ROOT/scripts/storage/attendance-selfie-lifecycle.json"
echo "Applying attendance selfie lifecycle to gs://$BUCKET ..."
gcloud storage buckets update "gs://$BUCKET" \
  --project="$PROJECT_ID" \
  --lifecycle-file="$LIFECYCLE"

echo "Done. Firestore records are untouched; only attendance/ Storage objects age>=120d are deleted."
