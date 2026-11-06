import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { normalizeGuardDocuments } from "@raskha/guard-management";
import type { GuardDocument, GuardGender } from "@raskha/guard-management";
import { adminFetch, adminUploadGuardFile } from "@raskha/shared";
import { APP_ROUTES } from "../../app/routePaths";
import { useAuthContext } from "../authentication";
import { useBranchContext } from "../branches";
import type { GuardFormValues } from "./guardTypes";

async function uploadDocumentIfPresent(file: File | null): Promise<string> {
  if (!file) return "";
  const saved = await adminUploadGuardFile(file);
  return saved.url;
}

async function uploadGuardDocuments(files: File[]): Promise<GuardDocument[]> {
  return Promise.all(
    files.map(async (file) => {
      const saved = await adminUploadGuardFile(file);
      return {
        name: file.name || saved.name || "Document",
        url: saved.url,
        contentType: file.type || saved.contentType,
      };
    }),
  );
}

export function useAddGuard() {
  const navigate = useNavigate();
  const { hrStaff } = useAuthContext();
  const { activeBranchId } = useBranchContext();
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
      const [characterCertificateUrl, policeVerificationUrl, profilePictureUrl] =
        await Promise.all([
          uploadDocumentIfPresent(values.characterCertificateFile),
          uploadDocumentIfPresent(values.policeVerificationFile),
          uploadDocumentIfPresent(values.profilePictureFile),
        ]);

      const documents = [
        ...normalizeGuardDocuments(values.documents),
        ...(await uploadGuardDocuments(values.documentFiles ?? [])),
      ];

      await adminFetch("/api/guards/account", {
        method: "POST",
        body: JSON.stringify({
          password: values.password,
          fullName: values.fullName,
          fatherName: values.fatherName,
          motherName: values.motherName,
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
          weeklyOffDays: values.weeklyOffDays,
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
          branchId: values.branchId || activeBranchId || null,
          documents,
        }),
      });

      navigate(APP_ROUTES.guardList, { replace: true });
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message ?? "Failed to save guard. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return { saveGuard, isSubmitting, error };
}
