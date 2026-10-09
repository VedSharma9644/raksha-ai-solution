/**
 * Full morning rush: login → today → geofence → signed-URL selfie → punch-in.
 *
 *   k6 run -e GUARD_API_URL=https://raskha-guard-app-api-....run.app scripts/load/k6-guard-morning-rush.js
 *
 * Run from scripts/load/ so relative fixture paths resolve, or set LOAD_FIXTURE_DIR.
 *
 * With LOAD_TEST_ALLOW_MULTI_PUNCH=true on the API, each VU sends X-Load-Test-Id
 * so shared demo credentials can still prove 150 concurrent Storage writes.
 * Set USE_SIGNED_URL=false to force legacy base64 JSON punch-in.
 */
import http from "k6/http";
import encoding from "k6/encoding";
import { check, sleep } from "k6";
import { SharedArray } from "k6/data";
import { Rate, Trend, Counter } from "k6/metrics";

const BASE =
  __ENV.GUARD_API_URL?.replace(/\/$/, "") ||
  "https://raskha-guard-app-api-csz7pz4xsq-el.a.run.app";
const VUS = Number(__ENV.VUS || 150);
const RAMP = Number(__ENV.RAMP || 45);
const HOLD = Number(__ENV.HOLD || 90);
const IDENTIFIER = __ENV.GUARD_ID || "RKS-8842";
const PASSWORD = __ENV.GUARD_PASSWORD || "demo1234";
// Defaults match demo site "Test" (5rSri9bhiI7AKVrAINts) so geofence unlocks under load.
const LAT = Number(__ENV.LOAD_LAT || 27.229995);
const LNG = Number(__ENV.LOAD_LNG || 77.506116);
const USE_SIGNED_URL = (__ENV.USE_SIGNED_URL || "true").toLowerCase() !== "false";

const loginFail = new Rate("login_failures");
const authzFail = new Rate("post_login_401");
const punchOk = new Counter("punch_in_success");
const punchDup = new Counter("punch_in_already_recorded");
const punchBusy = new Counter("punch_in_busy_503");
const uploadOk = new Counter("selfie_upload_success");
const uploadFail = new Counter("selfie_upload_failures");
const loginDuration = new Trend("login_duration_ms", true);
const punchDuration = new Trend("punch_in_duration_ms", true);
const uploadDuration = new Trend("selfie_upload_duration_ms", true);

const selfieB64 = (() => {
  try {
    return open("selfie.fixture.b64").trim();
  } catch (e1) {
    try {
      return open("scripts/load/selfie.fixture.b64").trim();
    } catch (e2) {
      return "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAn/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIQAxAAAAGfAP/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAQUCf//EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQMBAT8Bf//EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQIBAT8Bf//Z";
    }
  }
})();

const selfieBytes = encoding.b64decode(selfieB64);

const guards = new SharedArray("guards", () => {
  try {
    const raw = open("guards.fixture.json");
    const parsed = JSON.parse(raw);
    return parsed.guards || [];
  } catch (e1) {
    try {
      const raw = open("scripts/load/guards.fixture.json");
      const parsed = JSON.parse(raw);
      return parsed.guards || [];
    } catch (e2) {
      return Array.from({ length: VUS }, (_, i) => ({
        vu: i + 1,
        identifier: IDENTIFIER,
        password: PASSWORD,
      }));
    }
  }
});

export const options = {
  scenarios: {
    morning_rush: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: `${RAMP}s`, target: VUS },
        { duration: `${HOLD}s`, target: VUS },
        { duration: "20s", target: 0 },
      ],
      gracefulRampDown: "15s",
    },
  },
  thresholds: {
    login_failures: ["rate<0.01"],
    post_login_401: ["rate==0"],
    login_duration_ms: ["p(95)<2000"],
    punch_in_duration_ms: ["p(95)<5000"],
  },
};

function creds() {
  const idx = (__VU - 1) % Math.max(guards.length, 1);
  const g = guards[idx] || {};
  return {
    identifier: g.identifier || IDENTIFIER,
    password: g.password || PASSWORD,
  };
}

function loadTestId() {
  return `k6-vu${__VU}-iter${__ITER}-${Date.now()}`;
}

export default function () {
  const { identifier, password } = creds();
  const testId = loadTestId();

  const loginStarted = Date.now();
  const loginRes = http.post(
    `${BASE}/api/auth/login`,
    JSON.stringify({ identifier, password }),
    {
      headers: { "Content-Type": "application/json" },
      tags: { name: "login" },
      timeout: "30s",
    }
  );
  loginDuration.add(Date.now() - loginStarted);

  let token = "";
  try {
    token = loginRes.json("token") || "";
  } catch {
    token = "";
  }
  const loginOk = loginRes.status === 200 && Boolean(token);
  loginFail.add(!loginOk);
  if (!loginOk) {
    sleep(0.5);
    return;
  }

  const auth = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "X-Load-Test-Id": testId,
    },
    timeout: "60s",
  };

  const todayRes = http.get(`${BASE}/api/attendance/today`, {
    ...auth,
    tags: { name: "attendance_today" },
  });
  authzFail.add(todayRes.status === 401 ? 1 : 0);
  check(todayRes, {
    "today not 401": (r) => r.status !== 401,
  });

  const geoRes = http.post(
    `${BASE}/api/attendance/geofence-check`,
    JSON.stringify({ lat: LAT, lng: LNG, accuracyMeters: 5 }),
    { ...auth, tags: { name: "geofence_check" } }
  );
  authzFail.add(geoRes.status === 401 ? 1 : 0);
  check(geoRes, {
    "geofence not 401": (r) => r.status !== 401,
  });

  let punchBody = {
    lat: LAT,
    lng: LNG,
    accuracyMeters: 5,
    selfieBase64: selfieB64,
  };

  if (USE_SIGNED_URL) {
    const ticketRes = http.post(
      `${BASE}/api/attendance/selfie-upload-url`,
      JSON.stringify({ purpose: "punch_in_selfie" }),
      { ...auth, tags: { name: "selfie_upload_url" } }
    );

    if (ticketRes.status === 200) {
      let uploadUrl = "";
      let storagePath = "";
      let selfieUrl = "";
      try {
        uploadUrl = ticketRes.json("uploadUrl") || "";
        storagePath = ticketRes.json("storagePath") || "";
        selfieUrl = ticketRes.json("selfieUrl") || "";
      } catch {
        uploadUrl = "";
      }

      if (uploadUrl && storagePath) {
        const upStarted = Date.now();
        const putRes = http.put(uploadUrl, selfieBytes, {
          headers: { "Content-Type": "image/jpeg" },
          tags: { name: "selfie_storage_put" },
          timeout: "60s",
        });
        uploadDuration.add(Date.now() - upStarted);
        if (putRes.status >= 200 && putRes.status < 300) {
          uploadOk.add(1);
          punchBody = {
            lat: LAT,
            lng: LNG,
            accuracyMeters: 5,
            selfieStoragePath: storagePath,
            selfieUrl,
          };
        } else {
          uploadFail.add(1);
        }
      } else {
        uploadFail.add(1);
      }
    } else {
      uploadFail.add(1);
      authzFail.add(ticketRes.status === 401 ? 1 : 0);
    }
  }

  const punchStarted = Date.now();
  const punchRes = http.post(
    `${BASE}/api/attendance/punch-in`,
    JSON.stringify(punchBody),
    { ...auth, tags: { name: "punch_in" } }
  );
  punchDuration.add(Date.now() - punchStarted);

  if (punchRes.status === 401) {
    authzFail.add(1);
  } else if (punchRes.status === 201) {
    punchOk.add(1);
  } else if (punchRes.status === 409) {
    punchDup.add(1);
  } else if (punchRes.status === 503) {
    punchBusy.add(1);
  }

  check(punchRes, {
    "punch-in 201 or 409": (r) => r.status === 201 || r.status === 409,
    "punch-in not 401": (r) => r.status !== 401,
  });

  sleep(0.3);
}

export function handleSummary(data) {
  const lines = [
    "",
    "=== Guard morning-rush summary ===",
    `API: ${BASE}`,
    `VUs: ${VUS}`,
    `signed URL: ${USE_SIGNED_URL}`,
    `login p95 ms: ${fmt(data.metrics.login_duration_ms?.values["p(95)"])} (SLO < 2000)`,
    `selfie upload p95 ms: ${fmt(data.metrics.selfie_upload_duration_ms?.values["p(95)"])}`,
    `punch-in p95 ms: ${fmt(data.metrics.punch_in_duration_ms?.values["p(95)"])} (SLO < 5000)`,
    `login failures: ${pct(data.metrics.login_failures?.values.rate)}`,
    `post-login 401 rate: ${pct(data.metrics.post_login_401?.values.rate)} (SLO 0%)`,
    `selfie upload success: ${data.metrics.selfie_upload_success?.values.count ?? 0}`,
    `selfie upload failures: ${data.metrics.selfie_upload_failures?.values.count ?? 0}`,
    `punch-in success: ${data.metrics.punch_in_success?.values.count ?? 0}`,
    `punch-in already-recorded (409): ${data.metrics.punch_in_already_recorded?.values.count ?? 0}`,
    `punch-in busy (503): ${data.metrics.punch_in_busy_503?.values.count ?? 0}`,
    "",
  ];
  return { stdout: lines.join("\n") };
}

function fmt(v) {
  return v != null ? Number(v).toFixed(1) : "n/a";
}

function pct(v) {
  return v != null ? `${(v * 100).toFixed(2)}%` : "n/a";
}
