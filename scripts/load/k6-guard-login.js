/**
 * Baseline: 150 concurrent Guard logins.
 *
 *   k6 run -e GUARD_API_URL=https://raskha-guard-app-api-....run.app scripts/load/k6-guard-login.js
 *
 * Optional:
 *   -e VUS=150 -e RAMP=30 -e HOLD=60
 *   -e GUARD_ID=RKS-8842 -e GUARD_PASSWORD=demo1234
 */
import http from "k6/http";
import { check, sleep } from "k6";
import { Rate, Trend } from "k6/metrics";

const BASE =
  __ENV.GUARD_API_URL?.replace(/\/$/, "") ||
  "https://raskha-guard-app-api-csz7pz4xsq-el.a.run.app";
const VUS = Number(__ENV.VUS || 150);
const RAMP = Number(__ENV.RAMP || 30);
const HOLD = Number(__ENV.HOLD || 60);
const IDENTIFIER = __ENV.GUARD_ID || "RKS-8842";
const PASSWORD = __ENV.GUARD_PASSWORD || "demo1234";

const loginFail = new Rate("login_failures");
const loginDuration = new Trend("login_duration_ms", true);

export const options = {
  scenarios: {
    morning_login: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: `${RAMP}s`, target: VUS },
        { duration: `${HOLD}s`, target: VUS },
        { duration: "15s", target: 0 },
      ],
      gracefulRampDown: "10s",
    },
  },
  thresholds: {
    http_req_failed: ["rate<0.01"],
    login_failures: ["rate<0.01"],
    login_duration_ms: ["p(95)<2000"],
    http_req_duration: ["p(95)<2000"],
  },
};

export default function () {
  const started = Date.now();
  const res = http.post(
    `${BASE}/api/auth/login`,
    JSON.stringify({ identifier: IDENTIFIER, password: PASSWORD }),
    {
      headers: { "Content-Type": "application/json" },
      tags: { name: "login" },
      timeout: "30s",
    }
  );
  loginDuration.add(Date.now() - started);

  const ok = check(res, {
    "login status 200": (r) => r.status === 200,
    "login returns token": (r) => {
      try {
        return Boolean(r.json("token"));
      } catch {
        return false;
      }
    },
  });
  loginFail.add(!ok);
  sleep(0.2);
}

export function handleSummary(data) {
  return {
    stdout: textSummary(data),
  };
}

function textSummary(data) {
  const p95 = data.metrics.login_duration_ms?.values["p(95)"];
  const fail = data.metrics.login_failures?.values.rate;
  const lines = [
    "",
    "=== Guard login load summary ===",
    `API: ${BASE}`,
    `VUs: ${VUS}`,
    `login p95 ms: ${p95 != null ? p95.toFixed(1) : "n/a"} (SLO < 2000)`,
    `login failure rate: ${fail != null ? (fail * 100).toFixed(2) + "%" : "n/a"} (SLO < 1%)`,
    "",
  ];
  return lines.join("\n");
}
