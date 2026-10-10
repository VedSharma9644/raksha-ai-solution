import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getGuardById } from "@raskha/guard-management";
import type { Guard, GuardGender } from "@raskha/guard-management";
import { APP_ROUTES } from "../../app/routePaths";
import { auth, db, storage } from "../../lib/firebase";
import type { StaffMemberFormValues } from "../staff";

// Admin backend base URL — mirrors useEditHrStaff pattern
const ADMIN_BACKEND_URL =
  import.meta.env.VITE_ADMIN_API_URL?.replace(/\/$/, "") ?? "http://localhost:3001";

async function uploadDocumentIfPresent(
  file: File | null,
  path: string
): Promise<string> {
  if (!file) return "";
  const extension = file.name.includes(".")
    ? file.name.slice(file.name.lastIndexOf("."))
    : "";
  const storageRef = ref(storage, `${path}${extension}`);
  await uploadBytes(storageRef, file, {
    contentType: file.type || "application/octet-stream",
  });
  return getDownloadURL(storageRef);
}

export function useEditGuard(guardId: string) {
  const navigate = useNavigate();
  const [guard, setGuard] = useState<Guard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    if (!guardId) return;

    setIsLoading(true);
    setLoadError("");

    getGuardById(db, guardId)
      .then((data) => {
        if (!data) {
          setLoadError("Guard not found.");
        } else {
          setGuard(data);
        }
      })
      .catch((err: unknown) => {
        const e = err as { message?: string };
        setLoadError(e.message ?? "Failed to load guard.");
      })
      .finally(() => setIsLoading(false));
  }, [guardId]);

  async function saveGuard(values: StaffMemberFormValues) {
    setSaveError("");
    setIsSubmitting(true);

    try {
      const basePath = `agencies/${guard?.agencyId ?? "unknown"}/guards/${guardId}`;

      // Upload only if a new file was chosen — otherwise keep existing URL
      const [characterCertificateUrl, policeVerificationUrl, profilePictureUrl] =
        await Promise.all([
          values.characterCertificateFile
            ? uploadDocumentIfPresent(
                values.characterCertificateFile,
                `${basePath}/character-certificate`
              )
            : Promise.resolve(values.characterCertificateUrl),
          values.policeVerificationFile
            ? uploadDocumentIfPresent(
                values.policeVerificationFile,
                `${basePath}/police-verification`
              )
            : Promise.resolve(values.policeVerificationUrl),
          values.profilePictureFile
            ? uploadDocumentIfPresent(
                values.profilePictureFile,
                `${basePath}/profile-picture`
              )
            : Promise.resolve(values.profilePictureUrl),
        ]);

      await (async () => {
        const token = await auth.currentUser?.getIdToken();
        const res = await fetch(`${ADMIN_BACKEND_URL}/api/guards/${guardId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            fullName: values.fullName,
            fatherName: values.fatherName,
            gender: (values.gender || "male") as GuardGender,
            phone: values.phone,
            email: values.email,
            address: values.address,
            caste: values.caste,
            height: values.height,
            aadhaarNumber: values.aadhaarNumber,
            panNumber: values.panNumber,
            employeeCode: values.employeeCode,
            post: values.post,
            joiningDate: values.joiningDate,
            salary: values.salary,
            experience: values.experience,
            education: values.education,
            assignedSiteId: values.assignedSiteId,
            guardType: (values.guardType || "civilian") as "ex-serviceman" | "civilian",
            interestedCity: values.interestedCity,
            shiftFrom: values.shiftFrom,
            shiftTo: values.shiftTo,
            characterCertificateUrl,
            policeVerificationUrl,
            profilePictureUrl,
            bankAccount: values.bankAccount,
            esiNumber: values.esiNumber,
            pfNumber: values.pfNumber,
            notes: values.notes,
            branchId: values.branchId || null,
          }),
        });
        if (!res.ok) {
          const body = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(body.error ?? "Failed to update guard.");
        }
      })();

      // If a new password was supplied, update Firebase Auth via backend
      if (values.password) {
        const res = await fetch(`${ADMIN_BACKEND_URL}/api/guards/${guardId}/password`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: values.password }),
        });
        if (!res.ok) {
          const body = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(body.error ?? "Password update failed.");
        }
      }

      navigate(APP_ROUTES.employeeList, { replace: true });
    } catch (err: unknown) {
      const e = err as { message?: string };
      setSaveError(e.message ?? "Failed to update guard. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const initialValues: StaffMemberFormValues | undefined = guard
    ? {
        fullName: guard.fullName,
        fatherName: guard.fatherName ?? "",
        gender: (guard.gender ?? "") as StaffMemberFormValues["gender"],
        phone: guard.phone,
        email: guard.email,
        address: guard.address ?? "",
        caste: guard.caste ?? "",
        height: guard.height ?? "",
        aadhaarNumber: guard.aadhaarNumber ?? "",
        panNumber: guard.panNumber ?? "",
        employeeCode: guard.employeeCode,
        post: guard.post ?? "",
        joiningDate: guard.joiningDate ?? "",
        salary: guard.salary ?? "",
        experience: guard.experience ?? "",
        education: guard.education ?? "",
        assignedSiteId: guard.assignedSiteId,
        guardType: guard.guardType ?? "",
        interestedCity: guard.interestedCity ?? "",
        shiftFrom: guard.shiftFrom ?? "",
        shiftTo: guard.shiftTo ?? "",
        characterCertificateFile: null,
        policeVerificationFile: null,
        characterCertificateUrl: guard.characterCertificateUrl ?? "",
        policeVerificationUrl: guard.policeVerificationUrl ?? "",
        profilePictureFile: null,
        profilePictureUrl: guard.profilePictureUrl ?? "",
        bankAccount: guard.bankAccount ?? "",
        esiNumber: guard.esiNumber ?? "",
        pfNumber: guard.pfNumber ?? "",
        notes: guard.notes ?? "",
        branchId: guard.branchId ?? "",
        assignedBranchIds: [],
        password: "",
        confirmPassword: "",
      }
    : undefined;

  return { guard, initialValues, isLoading, isSubmitting, loadError, saveError, saveGuard };
}
