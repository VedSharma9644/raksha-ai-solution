# Guard API load-test results

Target: `https://raskha-guard-app-api-csz7pz4xsq-el.a.run.app`  
Revision after punch-in hardening: `raskha-guard-app-api-00009-v4s` (**1Gi / 2 CPU / min 1 / max 20 / concurrency 80**)  
Date: 2026-10-08

## Hardening shipped

1. **~20 concurrent selfie upload queue** (`SELFIE_UPLOAD_CONCURRENCY=20`) for base64→Storage path.
2. **Device resize/compress** (`expo-image-manipulator`, max edge 720px, JPEG ~0.55) before upload.
3. **Signed URL upload** (`POST /api/attendance/selfie-upload-url` → GCS PUT → punch with `selfieStoragePath`); base64 JSON kept as fallback.
4. **Date-indexed attendance** (`dutyDate` + Firestore composite index `guardId`+`dutyDate`).
5. **Cloud Run tune**: 2 CPU, concurrency 80.
6. **Early login reminder** at T−30 (spreads login before punch rush).
7. **Load-test multi-punch** via `LOAD_TEST_ALLOW_MULTI_PUNCH=true` + `X-Load-Test-Id` (demo only) to prove concurrent Storage writes with shared demo credentials.

## Morning rush (150 VUs) — PASS

Coords: demo site `Test` (`27.229995`, `77.506116`). Signed URL path enabled.

| Metric | Result | SLO |
|--------|--------|-----|
| Login p95 | **352 ms** | < 2000 ms |
| Selfie Storage PUT p95 | **2922 ms** | — |
| Punch-in p95 | **1813 ms** | < 5000 ms |
| Login failures | **0%** | < 1% |
| Post-login 401 | **0%** | 0% |
| Selfie upload success | **2511** (0 failures) | — |
| Punch-in success (201) | **2509** | — |
| Punch-in 409 / 503 | **0 / 0** | — |

Thresholds: **all passed** (k6 exit 0).

## Notes

- First k6 attempt used Delhi coords → geofence 403 on punch (uploads still succeeded). Defaults now match the demo site.
- Shared demo + `X-Load-Test-Id` proves **150 concurrent Storage writes** without seeding 150 Auth users. For multi-guard realism, seed unique guards and set `mode: "unique"` in `guards.fixture.json`.
- Turn off load-test multi-punch when done: set `LOAD_TEST_ALLOW_MULTI_PUNCH=false` on Cloud Run (or leave unset / false in deploy).

## Re-run

```powershell
cd scripts/load
k6 run -e GUARD_API_URL=https://raskha-guard-app-api-csz7pz4xsq-el.a.run.app `
  -e VUS=150 -e RAMP=45 -e HOLD=90 `
  k6-guard-morning-rush.js
```
