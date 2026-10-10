import { useNavigate } from "react-router-dom";
import { APP_ROUTES } from "../app/routePaths";
import { AddStaffMemberScreen } from "../features/staff";
import type { StaffMemberFormValues } from "../features/staff";
import { EMPTY_STAFF_MEMBER_FORM } from "../features/staff/staffFormTypes";
import { useAddGuard } from "../features/guards";
import { useAuthContext } from "../features/authentication";
import {
  useFormBuilderStatus,
  useFormSchema,
  FormBuilderForm,
} from "../features/formBuilder";
import { AppScreenLayout } from "../components/AppScreenLayout";
import { PageHeader } from "../components/PageHeader";

export function AddGuardPage() {
  const navigate = useNavigate();
  const { agency } = useAuthContext();
  const { saveGuard, isSubmitting, error } = useAddGuard();
  const { isEnabled, isLoading: isStatusLoading } = useFormBuilderStatus(
    agency?.id
  );
  const { fields, isLoading: isSchemaLoading } = useFormSchema(
    isEnabled ? agency?.id : undefined,
    "guard"
  );

  function goBack() {
    navigate(APP_ROUTES.dashboard);
  }

  if (isStatusLoading) {
    return null;
  }

  // Form Builder off → keep business running with the default form
  if (!isEnabled) {
    return (
      <>
        {error ? (
          <p role="alert" style={{ color: "red", padding: "1rem" }}>
            {error}
          </p>
        ) : null}
        <AddStaffMemberScreen
          role="guard"
          isNew={true}
          isSubmitting={isSubmitting}
          onBack={goBack}
          onCancel={goBack}
          onSubmit={saveGuard}
        />
      </>
    );
  }

  if (isSchemaLoading) {
    return null;
  }

  return (
    <AppScreenLayout>
      <div className="app-screen-layout__content">
        <PageHeader
          title="Add Guard"
          subtitle="Fill in the custom form for this agency."
          onBack={goBack}
          backLabel="Back to dashboard"
        />
        {error ? (
          <p role="alert" style={{ color: "red", padding: "1rem" }}>
            {error}
          </p>
        ) : null}
        <FormBuilderForm
          formType="guard"
          fields={fields}
          isSubmitting={isSubmitting}
          onCancel={goBack}
          onSubmit={async (data) => {
            // Merge with defaults so no field is ever undefined → Firestore rejects undefined
            const values: StaffMemberFormValues = {
              ...EMPTY_STAFF_MEMBER_FORM,
              fullName:        (data["fullName"]        as string) ?? "",
              fatherName:      (data["fatherName"]      as string) ?? "",
              phone:           (data["phone"]           as string) ?? "",
              email:           (data["email"]           as string) ?? "",
              address:         (data["address"]         as string) ?? "",
              caste:           (data["caste"]           as string) ?? "",
              height:          (data["height"]          as string) ?? "",
              aadhaarNumber:   (data["aadhaarNumber"]   as string) ?? "",
              panNumber:       (data["panNumber"]       as string) ?? "",
              employeeCode:    (data["employeeCode"]    as string) ?? "",
              post:            (data["post"]            as string) ?? "",
              joiningDate:     (data["joiningDate"]     as string) ?? "",
              salary:          (data["salary"]          as string) ?? "",
              experience:      (data["experience"]      as string) ?? "",
              education:       (data["education"]       as string) ?? "",
              assignedSiteId:  (data["assignedSiteId"]  as string) ?? "",
              guardType:       (data["guardType"]       as StaffMemberFormValues["guardType"]) ?? "",
              interestedCity:  (data["interestedCity"]  as string) ?? "",
              shiftFrom:       (data["shiftFrom"]       as string) ?? "",
              shiftTo:         (data["shiftTo"]         as string) ?? "",
              bankAccount:     (data["bankAccount"]     as string) ?? "",
              esiNumber:       (data["esiNumber"]       as string) ?? "",
              pfNumber:        (data["pfNumber"]        as string) ?? "",
              notes:           (data["notes"]           as string) ?? "",
              password:        (data["password"]        as string) ?? "",
              confirmPassword: (data["confirmPassword"] as string) ?? "",
              profilePictureFile:        (data["profilePictureFile"]        as File | null) ?? null,
              profilePictureUrl:         (data["profilePictureUrl"]         as string) ?? "",
              characterCertificateFile:  (data["characterCertificateFile"]  as File | null) ?? null,
              characterCertificateUrl:   (data["characterCertificateUrl"]   as string) ?? "",
              policeVerificationFile:    (data["policeVerificationFile"]    as File | null) ?? null,
              policeVerificationUrl:     (data["policeVerificationUrl"]     as string) ?? "",
            };
            await saveGuard(values);
          }}
        />
      </div>
    </AppScreenLayout>
  );
}
