import { beforeEach, describe, expect, it, vi } from "vitest";

const signInWithEmailAndPassword = vi.fn();
const signOut = vi.fn();
const getHrStaffById = vi.fn();

vi.mock("firebase/auth", () => ({
  signInWithEmailAndPassword: (...args: unknown[]) =>
    signInWithEmailAndPassword(...args),
  signOut: (...args: unknown[]) => signOut(...args),
  sendPasswordResetEmail: vi.fn(),
}));

vi.mock("@raskha/hr-management", () => ({
  getHrStaffById: (...args: unknown[]) => getHrStaffById(...args),
}));

const { loginHrStaff } = await import("../hrStaffAuth");

describe("loginHrStaff (HR panel Firebase login)", () => {
  const auth = {} as never;
  const db = {} as never;

  beforeEach(() => {
    signInWithEmailAndPassword.mockReset();
    signOut.mockReset();
    getHrStaffById.mockReset();
  });

  it("returns credential + hrStaff when active", async () => {
    const credential = { user: { uid: "hr-1" } };
    signInWithEmailAndPassword.mockResolvedValue(credential);
    getHrStaffById.mockResolvedValue({
      id: "hr-1",
      agencyId: "agency-1",
      fullName: "HR User",
      status: "active",
      email: "hr@agency.test",
    });

    const result = await loginHrStaff(auth, db, {
      email: "hr@agency.test",
      password: "secret123",
    });

    expect(result.credential).toBe(credential);
    expect(result.hrStaff.status).toBe("active");
    expect(signOut).not.toHaveBeenCalled();
  });

  it("signs out and throws when HR record is missing", async () => {
    signInWithEmailAndPassword.mockResolvedValue({
      user: { uid: "missing-hr" },
    });
    getHrStaffById.mockResolvedValue(null);

    await expect(
      loginHrStaff(auth, db, {
        email: "missing@agency.test",
        password: "secret123",
      })
    ).rejects.toThrow(/Account not found/i);

    expect(signOut).toHaveBeenCalledWith(auth);
  });

  it("signs out and throws when HR is inactive", async () => {
    signInWithEmailAndPassword.mockResolvedValue({
      user: { uid: "hr-2" },
    });
    getHrStaffById.mockResolvedValue({
      id: "hr-2",
      agencyId: "agency-1",
      status: "inactive",
    });

    await expect(
      loginHrStaff(auth, db, {
        email: "inactive@agency.test",
        password: "secret123",
      })
    ).rejects.toThrow(/inactive/i);

    expect(signOut).toHaveBeenCalledWith(auth);
  });
});
