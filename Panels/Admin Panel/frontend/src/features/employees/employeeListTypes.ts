import type { StaffRole } from "../staff/staffFormTypes";

export interface EmployeeListItem {
  id: string;
  fullName: string;
  employeeCode: string;
  role: StaffRole;
  phone: string;
  assignedSite: string;
  status: "active" | "on_leave" | "inactive";
  profilePictureUrl?: string;
}

export const SAMPLE_EMPLOYEES: EmployeeListItem[] = [
  {
    id: "emp-1",
    fullName: "Rajesh Kumar",
    employeeCode: "RK-4092",
    role: "guard",
    phone: "+91 98765 43210",
    assignedSite: "ABC Green Valley Heights",
    status: "active",
  },
  {
    id: "emp-2",
    fullName: "Amit Singh",
    employeeCode: "AS-2201",
    role: "supervisor",
    phone: "+91 98111 22334",
    assignedSite: "ABC Green Valley Heights",
    status: "active",
  },
  {
    id: "emp-3",
    fullName: "Neha Sharma",
    employeeCode: "NS-1180",
    role: "hr",
    phone: "+91 99001 11223",
    assignedSite: "Agency HQ",
    status: "active",
  },
  {
    id: "emp-4",
    fullName: "Suresh Patil",
    employeeCode: "SP-3314",
    role: "guard",
    phone: "+91 97654 88990",
    assignedSite: "Orion Tech Park",
    status: "on_leave",
  },
  {
    id: "emp-5",
    fullName: "Farhan Ali",
    employeeCode: "FA-5510",
    role: "guard",
    phone: "+91 91234 55667",
    assignedSite: "Metro Transit Hub",
    status: "inactive",
  },
];
