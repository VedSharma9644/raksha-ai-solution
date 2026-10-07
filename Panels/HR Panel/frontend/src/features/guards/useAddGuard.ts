import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { addGuard } from "@raskha/guard-management";
import { APP_ROUTES } from "../../app/routePaths";
import { useAuthContext } from "../authentication";
import { db, storage } from "../../lib/firebase";
import type { GuardFormValues } from "./guardTypes";

async function uploadDocumentIfPresent(
  file: File | null,
  path: string,
): Promise<string> {
  if (!file) return "";
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

export function useAddGuard() {
  const navigate = useNavigate();
  const { hrStaff } = useAuthContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function saveGuard(values: GuardFormValues) {
    if (!hrStaff) {
      setError("Not authenticated.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const timestamp = Date.now();
      const basePath = `agencies/${hrStaff.agencyId}/guards/${timestamp}`;

      // Upload documents to Firebase Storage in parallel
      const [characterCertificateUrl, policeVerificationUrl, profilePictureUrl] =
        await Promise.all([
          uploadDocumentIfPresent(
            values.characterCertificateFile,
            `${basePath}/character-certificate`,
          ),
          uploadDocumentIfPresent(
            values.policeVerificationFile,
            `${basePath}/police-verification`,
          ),
          uploadDocumentIfPresent(
            values.profilePictureFile,
            `${basePath}/profile-picture`,
          ),
        ]);

      await addGuard(db, {
        agencyId: hrStaff.agencyId,
        fullName: values.fullName,
        fatherName: values.fatherName,
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
        // HR panel does not assign sites — leave blank
        assignedSiteId: values.assignedSiteId,
        guardType: (values.guardType || "civilian") as
          | "ex-serviceman"
          | "civilian",
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
      });

      navigate(APP_ROUTES.dashboard, { replace: true });
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message ?? "Failed to save guard. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return { saveGuard, isSubmitting, error };
}
