import { describe, expect, it } from "vitest";
import {
  PANEL_ORIGINS,
  getCorsAllowedOrigins,
  isAllowedCorsOrigin,
} from "../panelOrigins";

describe("CORS panel origins", () => {
  it("allows production panel Hosting origins", () => {
    for (const origin of Object.values(PANEL_ORIGINS)) {
      expect(isAllowedCorsOrigin(origin)).toBe(true);
    }
  });

  it("allows local Vite origins and any localhost port", () => {
    expect(isAllowedCorsOrigin("http://localhost:5173")).toBe(true);
    expect(isAllowedCorsOrigin("http://127.0.0.1:5174")).toBe(true);
    expect(isAllowedCorsOrigin("http://localhost:4173")).toBe(true);
  });

  it("rejects undefined / empty / unknown origins", () => {
    expect(isAllowedCorsOrigin(undefined)).toBe(false);
    expect(isAllowedCorsOrigin("")).toBe(false);
    expect(isAllowedCorsOrigin("https://evil.example.com")).toBe(false);
    expect(isAllowedCorsOrigin("https://app-raksha-agency-admin.web.app.evil.com")).toBe(
      false
    );
  });

  it("accepts extra origins from env fixture (not real secrets)", () => {
    const extra = "https://staging.example.test";
    expect(isAllowedCorsOrigin(extra, extra)).toBe(true);
    expect(getCorsAllowedOrigins(extra)).toContain(extra);
  });
});
