export type StaffRole = "guard" | "supervisor" | "hr";

export interface StaffMemberFormValues {
  // Personal
  fullName: string;
  fatherName: string;
  phone: string;
  email: string;
  address: string;
  caste: string;
  height: string;
  aadhaarNumber: string;
  panNumber: string;

  // Employment
  employeeCode: string;
  post: string;
  joiningDate: string;
  salary: string;
  experience: string;
  education: string;
  assignedSiteId: string;

  // Preferences
  guardType: "ex-serviceman" | "civilian" | "";
  interestedCity: string;
  shiftFrom: string;
  shiftTo: string;

  // Document uploads (File objects — converted to URLs on save)
  characterCertificateFile: File | null;
  policeVerificationFile: File | null;
  /** Existing URLs shown when editing */
  characterCertificateUrl: string;
  policeVerificationUrl: string;

  // Financial / compliance
  bankAccount: string;
  esiNumber: string;
  pfNumber: string;

  notes: string;
}

export const EMPTY_STAFF_MEMBER_FORM: StaffMemberFormValues = {
  fullName: "",
  fatherName: "",
  phone: "",
  email: "",
  address: "",
  caste: "",
  height: "",
  aadhaarNumber: "",
  panNumber: "",
  employeeCode: "",
  post: "",
  joiningDate: "",
  salary: "",
  experience: "",
  education: "",
  assignedSiteId: "",
  guardType: "",
  interestedCity: "",
  shiftFrom: "",
  shiftTo: "",
  characterCertificateFile: null,
  policeVerificationFile: null,
  characterCertificateUrl: "",
  policeVerificationUrl: "",
  bankAccount: "",
  esiNumber: "",
  pfNumber: "",
  notes: "",
};

export const SAMPLE_SITE_OPTIONS = [
  { value: "site-green-valley", label: "ABC Green Valley Heights" },
  { value: "site-tech-park", label: "Orion Tech Park" },
  { value: "site-metro-hub", label: "Metro Transit Hub" },
];
