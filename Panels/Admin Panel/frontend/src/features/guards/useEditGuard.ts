import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getGuardById, normalizeGuardDocuments } from "@raskha/guard-management";
import type { Guard, GuardDocument, GuardGender } from "@raskha/guard-management";
import { adminFetch, adminUploadGuardFile } from "@raskha/shared";
import { APP_ROUTES } from "../../app/routePaths";
import { db } from "../../lib/firebase";
import type { StaffMemberFormValues } from "../staff";

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
    })
  );
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
      const [characterCertificateUrl, policeVerificationUrl, profilePictureUrl] =
        await Promise.all([
          values.characterCertificateFile
            ? uploadDocumentIfPresent(values.characterCertificateFile)
            : Promise.resolve(values.characterCertificateUrl),
          values.policeVerificationFile
            ? uploadDocumentIfPresent(values.policeVerificationFile)
            : Promise.resolve(values.policeVerificationUrl),
          values.profilePictureFile
            ? uploadDocumentIfPresent(values.profilePictureFile)
            : Promise.resolve(values.profilePictureUrl),
        ]);

      const documents = [
        ...normalizeGuardDocuments(values.documents),
        ...(await uploadGuardDocuments(values.documentFiles ?? [])),
      ];

      await adminFetch(`/api/guards/${guardId}`, {
        method: "PUT",
        body: JSON.stringify({
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
          documents,
        }),
      });

      // If a new password was supplied, update Firebase Auth via backend
      if (values.password) {
        await adminFetch(`/api/guards/${guardId}/password`, {
          method: "PUT",
          body: JSON.stringify({ password: values.password }),
        });
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
        motherName: guard.motherName ?? "",
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
        weeklyOffDays: Array.isArray(guard.weeklyOffDays)
          ? guard.weeklyOffDays
          : [],
        guardType: guard.guardType ?? "",
        interestedCity: guard.interestedCity ?? "",
        shiftFrom: guard.shiftFrom ?? "",
        shiftTo: guard.shiftTo ?? "",
        characterCertificateFile: null,
        policeVerificationFile: null,
        characterCertificateUrl: guard.characterCertificateUrl ?? "",
        policeVerificationUrl: guard.policeVerificationUrl ?? "",
        documentFiles: [],
        documents: normalizeGuardDocuments(guard.documents),
        profilePictureFile: null,
        profilePictureUrl: guard.profilePictureUrl ?? "",
        bankAccount: guard.bankAccount ?? "",
        esiNumber: guard.esiNumber ?? "",
        pfNumber: guard.pfNumber ?? "",
        notes: guard.notes ?? "",
        branchId: guard.branchId ?? "",
        assignedBranchIds: [],
        assignedSiteIds: [],
        password: "",
        confirmPassword: "",
      }
    : undefined;

  return { guard, initialValues, isLoading, isSubmitting, loadError, saveError, saveGuard };
}
