import type { FormField } from "./formField";

/**
 * Locked core fields for the Guard form.
 * These are always present and can never be removed.
 * Section entries are layout-only headings (not locked — agencies may rename/remove).
 */
export const DEFAULT_GUARD_FIELDS: FormField[] = [
  { id: "profilePicture", label: "Profile Photo", type: "profilePicture", required: false, locked: true, order: 0 },

  { id: "section_personal", label: "Personal Details", type: "section", required: false, locked: false, order: 1 },
  { id: "fullName", label: "Full Name", type: "text", required: true, locked: true, order: 2 },
  { id: "fatherName", label: "Father's Name", type: "text", required: false, locked: false, order: 3 },
  { id: "motherName", label: "Mother's Name", type: "text", required: false, locked: false, order: 4 },
  { id: "phone", label: "Mobile Number", type: "phone", required: true, locked: true, order: 5 },
  { id: "email", label: "Email", type: "email", required: true, locked: true, order: 6 },
  { id: "gender", label: "Gender", type: "select", required: true, locked: true, order: 7,
    options: [
      { value: "male",   label: "Male" },
      { value: "female", label: "Female" },
      { value: "other",  label: "Other" },
    ]},
  { id: "address", label: "Address", type: "textarea", required: false, locked: false, order: 8 },
  { id: "caste", label: "Caste", type: "text", required: false, locked: false, order: 9 },
  { id: "height", label: "Height", type: "text", required: false, locked: false, order: 10, placeholder: "e.g. 5'8\"" },

  { id: "section_identity", label: "Identity Documents", type: "section", required: false, locked: false, order: 11 },
  { id: "aadhaarNumber", label: "Aadhaar Number", type: "text", required: true, locked: true, order: 12, placeholder: "12-digit Aadhaar" },
  { id: "panNumber", label: "PAN Number", type: "text", required: false, locked: false, order: 13, placeholder: "e.g. ABCDE1234F" },

  { id: "section_employment", label: "Employment Details", type: "section", required: false, locked: false, order: 14 },
  { id: "employeeCode", label: "Employee Code", type: "text", required: true, locked: true, order: 15 },
  { id: "post", label: "Post / Designation", type: "text", required: true, locked: false, order: 16, placeholder: "e.g. Security Guard" },
  { id: "joiningDate", label: "Joining Date", type: "date", required: true, locked: false, order: 17 },
  { id: "salary", label: "Salary (₹)", type: "text", required: true, locked: false, order: 18, placeholder: "e.g. 15000" },
  { id: "experience", label: "Experience", type: "text", required: false, locked: false, order: 19, placeholder: "e.g. 3 years" },
  { id: "education", label: "Education", type: "text", required: false, locked: false, order: 20, placeholder: "e.g. 10th Pass, Graduate" },

  { id: "section_preferences", label: "Preferences", type: "section", required: false, locked: false, order: 21 },
  { id: "guardType", label: "Ex-Serviceman / Civilian", type: "select", required: false, locked: false, order: 22,
    options: [{ value: "ex-serviceman", label: "Ex-Serviceman" }, { value: "civilian", label: "Civilian" }] },
  { id: "interestedCity", label: "Interested City", type: "text", required: false, locked: false, order: 23, placeholder: "e.g. Delhi, Mumbai" },
  { id: "shiftFrom", label: "Shift From", type: "text", required: false, locked: false, order: 24, placeholder: "e.g. 08:00" },
  { id: "shiftTo", label: "Shift To", type: "text", required: false, locked: false, order: 25, placeholder: "e.g. 20:00" },

  { id: "section_documents", label: "Documents", type: "section", required: false, locked: false, order: 26 },
  { id: "characterCertificateFile", label: "Character Certificate", type: "file", required: false, locked: false, order: 27 },
  { id: "policeVerificationFile", label: "Police Verification", type: "file", required: false, locked: false, order: 28 },

  { id: "section_financial", label: "Financial & Compliance", type: "section", required: false, locked: false, order: 29 },
  { id: "bankAccount", label: "Bank Account Number", type: "text", required: false, locked: false, order: 30 },
  { id: "esiNumber", label: "ESI Number", type: "text", required: false, locked: false, order: 31 },
  { id: "pfNumber", label: "PF Number", type: "text", required: false, locked: false, order: 32 },
  { id: "notes", label: "Notes", type: "textarea", required: false, locked: false, order: 33 },

  { id: "section_login", label: "Login Credentials", type: "section", required: false, locked: false, order: 34 },
  { id: "password", label: "Login Password", type: "password", required: true, locked: true, order: 35 },
];

/**
 * Locked core fields for the HR Staff form.
 */
export const DEFAULT_HR_FIELDS: FormField[] = [
  { id: "section_personal", label: "Personal Details", type: "section", required: false, locked: false, order: 1 },
  { id: "fullName", label: "Full Name", type: "text", required: true, locked: true, order: 2 },
  { id: "phone", label: "Mobile Number", type: "phone", required: true, locked: true, order: 3 },
  { id: "email", label: "Email", type: "email", required: true, locked: true, order: 4 },
  { id: "employeeCode", label: "Employee Code", type: "text", required: true, locked: true, order: 5 },
  { id: "section_login", label: "Login Credentials", type: "section", required: false, locked: false, order: 6 },
  { id: "password", label: "Login Password", type: "password", required: false, locked: true, order: 7, placeholder: "Min. 8 characters (required when adding)" },
  { id: "notes", label: "Notes", type: "textarea", required: false, locked: false, order: 8 },
];

/**
 * Locked core fields for the Site form.
 */
export const DEFAULT_SITE_FIELDS: FormField[] = [
  { id: "section_site", label: "Site Details", type: "section", required: false, locked: false, order: 1 },
  { id: "siteName", label: "Site Name", type: "text", required: true, locked: true, order: 2 },
  { id: "siteType", label: "Site Type", type: "select", required: false, locked: false, order: 3,
    options: [
      { value: "industrial", label: "Industrial" },
      { value: "hospital", label: "Hospital" },
      { value: "hotel", label: "Hotel" },
      { value: "mall", label: "Mall" },
      { value: "company", label: "Company" },
      { value: "temple", label: "Temple" },
      { value: "workshop", label: "Workshop" },
      { value: "refinery", label: "Refinery" },
      { value: "bank", label: "Bank" },
      { value: "medical-college", label: "Medical College" },
      { value: "other", label: "Other" },
    ]},
  { id: "clientName", label: "Client Name", type: "text", required: false, locked: false, order: 4 },
  { id: "address", label: "Address", type: "textarea", required: false, locked: false, order: 5 },
  { id: "city", label: "City", type: "text", required: false, locked: false, order: 6 },

  { id: "section_contacts", label: "Contacts", type: "section", required: false, locked: false, order: 7 },
  { id: "managerName", label: "Manager Name", type: "text", required: false, locked: false, order: 8 },
  { id: "managerContact", label: "Manager Contact", type: "phone", required: false, locked: false, order: 9 },
  { id: "hrName", label: "HR Name", type: "text", required: false, locked: false, order: 10 },
  { id: "hrContact", label: "HR Contact", type: "phone", required: false, locked: false, order: 11 },
  { id: "siteSupervisor", label: "Site Supervisor", type: "text", required: false, locked: false, order: 12 },
  { id: "contactPerson", label: "Contact Person", type: "text", required: false, locked: false, order: 13 },
  { id: "contactPhone", label: "Contact Phone", type: "phone", required: false, locked: false, order: 14 },
  { id: "notes", label: "Notes", type: "textarea", required: false, locked: false, order: 15 },

  { id: "section_location", label: "Location", type: "section", required: false, locked: false, order: 16 },
  { id: "location", label: "Site Location", type: "location", required: false, locked: true, order: 17 },
  // Shift configuration — always present, cannot be removed
  { id: "shiftConfig", label: "Shift Configuration", type: "shiftConfig", required: false, locked: true, order: 18 },
];
