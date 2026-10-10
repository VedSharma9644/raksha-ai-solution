export type StaffRole = "guard" | "supervisor" | "hr";

export interface StaffMemberFormValues {
  // Personal
  fullName: string;
  fatherName: string;
  gender: "male" | "female" | "other" | "";
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

  // Profile picture upload
  profilePictureFile: File | null;
  /** Existing URL shown when editing */
  profilePictureUrl: string;

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

  // Branch assignment
  /** For guards/supervisors — which branch they belong to ("" = unassigned) */
  branchId: string;
  /** For HR staff — which branches they can access */
  assignedBranchIds: string[];

  // Login credentials (password only stored in Firebase Auth, never Firestore)
  // Required on Add; leave blank on Edit to keep existing password
  password: string;
  confirmPassword: string;
}

export const EMPTY_STAFF_MEMBER_FORM: StaffMemberFormValues = {
  fullName: "",
  fatherName: "",
  gender: "",
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
  profilePictureFile: null,
  profilePictureUrl: "",
  bankAccount: "",
  esiNumber: "",
  pfNumber: "",
  notes: "",
  branchId: "",
  assignedBranchIds: [],
  password: "",
  confirmPassword: "",
};

export const SAMPLE_SITE_OPTIONS = [
  { value: "site-green-valley", label: "ABC Green Valley Heights" },
  { value: "site-tech-park", label: "Orion Tech Park" },
  { value: "site-metro-hub", label: "Metro Transit Hub" },
];
