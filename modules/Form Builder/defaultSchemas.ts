import type { FormField } from "./formField";

/**
 * Locked core fields for the Guard form.
 * These are always present and can never be removed.
 */
export const DEFAULT_GUARD_FIELDS: FormField[] = [
  // Profile picture — shown at the top, always present
  { id: "profilePicture",  label: "Profile Photo",       type: "profilePicture", required: false, locked: true,  order: 0 },
  { id: "fullName",       label: "Full Name",          type: "text",     required: true,  locked: true,  order: 1 },
  { id: "fatherName",     label: "Father's Name",       type: "text",     required: false, locked: false, order: 2 },
  { id: "phone",          label: "Mobile Number",       type: "phone",    required: true,  locked: true,  order: 3 },
  { id: "email",          label: "Email",               type: "email",    required: true,  locked: true,  order: 4 },
  { id: "address",        label: "Address",             type: "textarea", required: false, locked: false, order: 5 },
  { id: "caste",          label: "Caste",               type: "text",     required: false, locked: false, order: 6 },
  { id: "height",         label: "Height",              type: "text",     required: false, locked: false, order: 7, placeholder: "e.g. 5'8\"" },
  { id: "aadhaarNumber",  label: "Aadhaar Number",      type: "text",     required: true,  locked: true,  order: 8, placeholder: "12-digit Aadhaar" },
  { id: "panNumber",      label: "PAN Number",          type: "text",     required: false, locked: false, order: 9, placeholder: "e.g. ABCDE1234F" },
  { id: "employeeCode",   label: "Employee Code",       type: "text",     required: true,  locked: true,  order: 10 },
  { id: "post",           label: "Post / Designation",  type: "text",     required: true,  locked: false, order: 11, placeholder: "e.g. Security Guard" },
  { id: "joiningDate",    label: "Joining Date",        type: "date",     required: true,  locked: false, order: 12 },
  { id: "salary",         label: "Salary (₹)",          type: "text",     required: true,  locked: false, order: 13, placeholder: "e.g. 15000" },
  { id: "experience",     label: "Experience",          type: "text",     required: false, locked: false, order: 14, placeholder: "e.g. 3 years" },
  { id: "education",      label: "Education",           type: "text",     required: false, locked: false, order: 15, placeholder: "e.g. 10th Pass, Graduate" },
  { id: "guardType",      label: "Ex-Serviceman / Civilian", type: "select", required: false, locked: false, order: 16,
    options: [{ value: "ex-serviceman", label: "Ex-Serviceman" }, { value: "civilian", label: "Civilian" }] },
  { id: "interestedCity", label: "Interested City",     type: "text",     required: false, locked: false, order: 17, placeholder: "e.g. Delhi, Mumbai" },
  { id: "shiftFrom",      label: "Shift From",          type: "text",     required: false, locked: false, order: 18, placeholder: "e.g. 08:00" },
  { id: "shiftTo",        label: "Shift To",            type: "text",     required: false, locked: false, order: 19, placeholder: "e.g. 20:00" },
  { id: "characterCertificateFile", label: "Character Certificate", type: "file", required: false, locked: false, order: 20 },
  { id: "policeVerificationFile",   label: "Police Verification",   type: "file", required: false, locked: false, order: 21 },
  { id: "bankAccount",    label: "Bank Account Number", type: "text",     required: false, locked: false, order: 22 },
  { id: "esiNumber",      label: "ESI Number",          type: "text",     required: false, locked: false, order: 23 },
  { id: "pfNumber",       label: "PF Number",           type: "text",     required: false, locked: false, order: 24 },
  { id: "notes",          label: "Notes",               type: "textarea", required: false, locked: false, order: 25 },
  // Login credentials — always required, cannot be removed
  { id: "password",       label: "Login Password",      type: "password", required: true,  locked: true,  order: 26 },
];

/**
 * Locked core fields for the HR Staff form.
 */
export const DEFAULT_HR_FIELDS: FormField[] = [
  { id: "fullName",     label: "Full Name",      type: "text",  required: true,  locked: true,  order: 1 },
  { id: "phone",        label: "Mobile Number",  type: "phone", required: true,  locked: true,  order: 2 },
  { id: "email",        label: "Email",          type: "email", required: true,  locked: true,  order: 3 },
  { id: "employeeCode", label: "Employee Code",  type: "text",  required: true,  locked: true,  order: 4 },
  { id: "password",     label: "Login Password", type: "password",  required: false, locked: true,  order: 5, placeholder: "Min. 8 characters (required when adding)" },
  { id: "notes",        label: "Notes",          type: "textarea", required: false, locked: false, order: 6 },
];

/**
 * Locked core fields for the Site form.
 */
export const DEFAULT_SITE_FIELDS: FormField[] = [
  { id: "siteName",        label: "Site Name",        type: "text",   required: true,  locked: true,  order: 1 },
  { id: "siteType",        label: "Site Type",        type: "select", required: false, locked: false, order: 2,
    options: [
      { value: "industrial",      label: "Industrial" },
      { value: "hospital",        label: "Hospital" },
      { value: "hotel",           label: "Hotel" },
      { value: "mall",            label: "Mall" },
      { value: "company",         label: "Company" },
      { value: "temple",          label: "Temple" },
      { value: "workshop",        label: "Workshop" },
      { value: "refinery",        label: "Refinery" },
      { value: "bank",            label: "Bank" },
      { value: "medical-college", label: "Medical College" },
      { value: "other",           label: "Other" },
    ]},
  { id: "clientName",      label: "Client Name",      type: "text",   required: false, locked: false, order: 3 },
  { id: "address",         label: "Address",          type: "textarea", required: false, locked: false, order: 4 },
  { id: "city",            label: "City",             type: "text",   required: false, locked: false, order: 5 },
  { id: "managerName",     label: "Manager Name",     type: "text",   required: false, locked: false, order: 6 },
  { id: "managerContact",  label: "Manager Contact",  type: "phone",  required: false, locked: false, order: 7 },
  { id: "hrName",          label: "HR Name",          type: "text",   required: false, locked: false, order: 8 },
  { id: "hrContact",       label: "HR Contact",       type: "phone",  required: false, locked: false, order: 9 },
  { id: "siteSupervisor",  label: "Site Supervisor",  type: "text",   required: false, locked: false, order: 10 },
  { id: "contactPerson",   label: "Contact Person",   type: "text",   required: false, locked: false, order: 11 },
  { id: "contactPhone",    label: "Contact Phone",    type: "phone",  required: false, locked: false, order: 12 },
  { id: "notes",           label: "Notes",            type: "textarea", required: false, locked: false, order: 13 },
  // Site location (Google Maps + lat/lng) — always present, cannot be removed
  { id: "location",        label: "Site Location",    type: "location", required: false, locked: true,  order: 14 },
];
