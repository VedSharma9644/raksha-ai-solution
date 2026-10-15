export type LeaveRequestStatus = "pending" | "approved" | "rejected";

export interface LeaveRequest {
  id: string;
  guardName: string;
  employeeCode: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: LeaveRequestStatus;
}

export const SAMPLE_LEAVE_REQUESTS: LeaveRequest[] = [
  {
    id: "leave-1",
    guardName: "Suresh Patil",
    employeeCode: "SP-3314",
    leaveType: "Casual leave",
    startDate: "2026-10-08",
    endDate: "2026-10-10",
    reason: "Family function",
    status: "pending",
  },
  {
    id: "leave-2",
    guardName: "Rajesh Kumar",
    employeeCode: "RK-4092",
    leaveType: "Sick leave",
    startDate: "2026-10-06",
    endDate: "2026-10-07",
    reason: "Medical rest",
    status: "approved",
  },
  {
    id: "leave-3",
    guardName: "Vikram Das",
    employeeCode: "VD-7721",
    leaveType: "Emergency leave",
    startDate: "2026-10-12",
    endDate: "2026-10-12",
    reason: "Personal emergency",
    status: "pending",
  },
  {
    id: "leave-4",
    guardName: "Farhan Ali",
    employeeCode: "FA-5510",
    leaveType: "Casual leave",
    startDate: "2026-09-28",
    endDate: "2026-09-29",
    reason: "Travel",
    status: "rejected",
  },
];
