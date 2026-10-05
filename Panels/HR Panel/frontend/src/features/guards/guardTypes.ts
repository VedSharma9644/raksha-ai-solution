export interface GuardFormValues {
  fullName: string;
  employeeCode: string;
  phone: string;
  email: string;
  notes: string;
}

export const EMPTY_GUARD_FORM: GuardFormValues = {
  fullName: "",
  employeeCode: "",
  phone: "",
  email: "",
  notes: "",
};

export interface GuardListItem {
  id: string;
  fullName: string;
  employeeCode: string;
  phone: string;
  status: "active" | "on_leave" | "inactive";
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
