export type StaffRole = "guard" | "supervisor" | "hr";

export interface StaffMemberFormValues {
  fullName: string;
  employeeCode: string;
  phone: string;
  email: string;
  assignedSiteId: string;
  notes: string;
}

export const EMPTY_STAFF_MEMBER_FORM: StaffMemberFormValues = {
  fullName: "",
  employeeCode: "",
  phone: "",
  email: "",
  assignedSiteId: "",
  notes: "",
};

export const SAMPLE_SITE_OPTIONS = [
  { value: "site-green-valley", label: "ABC Green Valley Heights" },
  { value: "site-tech-park", label: "Orion Tech Park" },
  { value: "site-metro-hub", label: "Metro Transit Hub" },
];
