import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getGuardById, updateGuard } from "@raskha/guard-management";
import type { Guard } from "@raskha/guard-management";
import { APP_ROUTES } from "../../app/routePaths";
import { db, storage } from "../../lib/firebase";
import type { StaffMemberFormValues } from "../staff";

async function uploadDocumentIfPresent(
  file: File | null,
  path: string
): Promise<string> {
  if (!file) return "";
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
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
      const [characterCertificateUrl, policeVerificationUrl] =
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
        ]);

      await updateGuard(db, guardId, {
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
        assignedSiteId: values.assignedSiteId,
        guardType: (values.guardType || "civilian") as "ex-serviceman" | "civilian",
        interestedCity: values.interestedCity,
        shiftFrom: values.shiftFrom,
        shiftTo: values.shiftTo,
        characterCertificateUrl,
        policeVerificationUrl,
        bankAccount: values.bankAccount,
        esiNumber: values.esiNumber,
        pfNumber: values.pfNumber,
        notes: values.notes,
      });

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
        bankAccount: guard.bankAccount ?? "",
        esiNumber: guard.esiNumber ?? "",
        pfNumber: guard.pfNumber ?? "",
        notes: guard.notes ?? "",
      }
    : undefined;

  return { guard, initialValues, isLoading, isSubmitting, loadError, saveError, saveGuard };
}
