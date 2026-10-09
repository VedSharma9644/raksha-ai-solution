# Guard API load tests (k6)

Simulate **150 concurrent** Guard users at shift start against Cloud Run.

## Prerequisites

1. Install [k6](https://k6.io/docs/get-started/installation/)
2. Generate fixtures (selfie ~200KB + 150 credential rows):

```bash
node scripts/load/generate-fixtures.mjs
```

3. Guard API must have:
   - Firestore-backed sessions (shared across Cloud Run instances)
   - `ATTENDANCE_DEMO_MODE=true` **or** a seeded Load Test Agency with unique guards
   - `LOAD_TEST_ALLOW_MULTI_PUNCH=true` + `X-Load-Test-Id` (morning-rush script sends this) so shared demo can prove **150 Storage writes**
   - Scaled Cloud Run (deploy script: Guard **1Gi / 2 CPU / min 1 / max 20 / concurrency 80**)
   - `SELFIE_UPLOAD_CONCURRENCY=20` (base64 path queue; signed-URL path uploads go direct to Storage)

## Credentials

`guards.fixture.json` defaults to **shared demo** credentials (`GUARD_DEMO_ID` / `GUARD_DEMO_PASSWORD`):

| Field | Default |
|-------|---------|
| identifier | `RKS-8842` |
| password | `demo1234` |

- **Login baseline**: all 150 VUs can share demo credentials.
- **Morning rush (signed URL + load-test id)**: each VU gets a unique `X-Load-Test-Id`, so punch-in can succeed many times under one demo guard while still writing unique Storage objects.
- Without the load-test flag, the same `guardId` can only punch in **once per day** (HTTP **409**).
- For true multi-guard realism, seed 150 unique Firebase Auth + Firestore `guards` docs and replace `guards.fixture.json` (`mode: "unique"`).

Do **not** point morning-rush punch-in at production agencies with real employee data.

## Run — login baseline

From repo root (or `scripts/load`):

```bash
k6 run -e GUARD_API_URL=https://raskha-guard-app-api-csz7pz4xsq-el.a.run.app ^
  -e VUS=150 -e RAMP=30 -e HOLD=60 ^
  scripts/load/k6-guard-login.js
```

## Run — morning rush (login → today → geofence → signed URL → punch-in)

```bash
cd scripts/load
k6 run -e GUARD_API_URL=https://raskha-guard-app-api-csz7pz4xsq-el.a.run.app ^
  -e VUS=150 -e RAMP=45 -e HOLD=90 ^
  k6-guard-morning-rush.js
```

Force legacy base64 JSON punch-in (no Storage PUT):

```bash
-e USE_SIGNED_URL=false
```

Optional site coords (defaults match demo site `Test`):

```bash
-e LOAD_LAT=27.229995 -e LOAD_LNG=77.506116
```


## SLOs

| Metric | Target |
|--------|--------|
| Login p95 | < 2s |
| Punch-in p95 | < 5s |
| Login failure rate | < 1% |
| 401 after successful login | **0%** (validates shared sessions) |

## Seeding a Load Test Agency (unique punch-ins)

1. Create an agency in Super Admin / Admin panel.
2. Add 150 active guards with Firebase Auth passwords (scripted via Admin API or console).
3. Regenerate fixtures:

```bash
# Example: write your own JSON with unique identifier/password per VU
# then set "mode": "unique" in guards.fixture.json
node scripts/load/generate-fixtures.mjs
```

4. Set `ATTENDANCE_DEMO_MODE=false` on Guard Cloud Run when using real Auth passwords.
