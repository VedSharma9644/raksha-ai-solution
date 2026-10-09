import { beforeEach, describe, expect, it, vi } from "vitest";

const signInWithEmailAndPassword = vi.fn();
const signOut = vi.fn();
const getDocFromServer = vi.fn();
const getDoc = vi.fn();
const doc = vi.fn((_db: unknown, _col: string, id: string) => ({ id }));

vi.mock("firebase/auth", () => ({
  signInWithEmailAndPassword: (...args: unknown[]) =>
    signInWithEmailAndPassword(...args),
  signOut: (...args: unknown[]) => signOut(...args),
  createUserWithEmailAndPassword: vi.fn(),
}));

vi.mock("firebase/firestore", () => ({
  doc: (...args: unknown[]) => doc(...args),
  getDoc: (...args: unknown[]) => getDoc(...args),
  getDocFromServer: (...args: unknown[]) => getDocFromServer(...args),
  setDoc: vi.fn(),
  serverTimestamp: vi.fn(),
}));

const { loginAgency } = await import("../agencyAuth");

describe("loginAgency (Admin panel Firebase login)", () => {
  const auth = {} as never;
  const db = {} as never;

  beforeEach(() => {
    signInWithEmailAndPassword.mockReset();
    signOut.mockReset();
    getDocFromServer.mockReset();
    getDoc.mockReset();
    doc.mockClear();
  });

  it("returns credential + agency when active", async () => {
    const credential = { user: { uid: "agency-1" } };
    signInWithEmailAndPassword.mockResolvedValue(credential);
    getDocFromServer.mockResolvedValue({
      exists: () => true,
      id: "agency-1",
      data: () => ({
        id: "agency-1",
        name: "Raskha Agency",
        status: "active",
        email: "admin@agency.test",
      }),
    });

    const result = await loginAgency(auth, db, {
      email: "admin@agency.test",
      password: "secret123",
    });

    expect(result.credential).toBe(credential);
    expect(result.agency.status).toBe("active");
    expect(signOut).not.toHaveBeenCalled();
  });

  it("signs out and throws when agency is missing", async () => {
    signInWithEmailAndPassword.mockResolvedValue({
      user: { uid: "missing" },
    });
    getDocFromServer.mockResolvedValue({ exists: () => false });

    await expect(
      loginAgency(auth, db, {
        email: "gone@agency.test",
        password: "secret123",
      })
    ).rejects.toThrow(/Account not found/i);

    expect(signOut).toHaveBeenCalledWith(auth);
  });

  it("signs out and throws when agency is inactive", async () => {
    signInWithEmailAndPassword.mockResolvedValue({
      user: { uid: "agency-2" },
    });
    getDocFromServer.mockResolvedValue({
      exists: () => true,
      id: "agency-2",
      data: () => ({
        id: "agency-2",
        name: "Paused",
        status: "paused",
      }),
    });

    await expect(
      loginAgency(auth, db, {
        email: "paused@agency.test",
        password: "secret123",
      })
    ).rejects.toThrow(/inactive/i);

    expect(signOut).toHaveBeenCalledWith(auth);
  });
});
