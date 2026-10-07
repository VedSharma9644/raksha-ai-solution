export interface GuardFormValues {
  // Personal
  fullName: string;
  fatherName: string;
  phone: string;
  email: string;
  address: string;
  caste: string;
  height: string;

  // Identity
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

  // Profile picture
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
}

export const EMPTY_GUARD_FORM: GuardFormValues = {
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
  profilePictureFile: null,
  profilePictureUrl: "",
  bankAccount: "",
  esiNumber: "",
  pfNumber: "",
  notes: "",
};

export interface GuardListItem {
  id: string;
  fullName: string;
  employeeCode: string;
  phone: string;
  status: "active" | "on_leave" | "inactive";
  profilePictureUrl?: string;
}

export const SAMPLE_GUARDS: GuardListItem[] = [
  {
    id: "guard-1",
    fullName: "Rajesh Kumar",
    employeeCode: "RK-4092",
    phone: "+91 98765 43210",
    status: "active",
  },
  {
    id: "guard-2",
    fullName: "Suresh Patil",
    employeeCode: "SP-3314",
    phone: "+91 97654 88990",
    status: "on_leave",
  },
  {
    id: "guard-3",
    fullName: "Farhan Ali",
    employeeCode: "FA-5510",
    phone: "+91 91234 55667",
    status: "inactive",
  },
  {
    id: "guard-4",
    fullName: "Vikram Das",
    employeeCode: "VD-7721",
    phone: "+91 99887 66554",
    status: "active",
  },
];
