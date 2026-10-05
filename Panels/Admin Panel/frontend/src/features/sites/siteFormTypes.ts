export interface SiteFormValues {
  siteName: string;
  clientName: string;
  address: string;
  city: string;
  contactPerson: string;
  contactPhone: string;
  notes: string;
}

export const EMPTY_SITE_FORM: SiteFormValues = {
  siteName: "",
  clientName: "",
  address: "",
  city: "",
  contactPerson: "",
  contactPhone: "",
  notes: "",
};
