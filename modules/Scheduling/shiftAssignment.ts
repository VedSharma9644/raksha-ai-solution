import { Timestamp } from "firebase/firestore";

export type DayOfWeek = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export const ALL_DAYS: DayOfWeek[] = [
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
  "sun",
];

export const DAY_LABELS: Record<DayOfWeek, string> = {
  mon: "Mon",
  tue: "Tue",
  wed: "Wed",
  thu: "Thu",
  fri: "Fri",
  sat: "Sat",
  sun: "Sun",
};

export const DAY_FULL_LABELS: Record<DayOfWeek, string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};

/**
 * A guard's recurring shift assignment at a site.
 * Stored in the "shiftAssignments" top-level Firestore collection.
 */
export interface GuardShiftAssignment {
  id: string;
  agencyId: string;
  siteId: string;
  guardId: string;
  guardName: string;
  /** References SiteShift.id in site.shiftConfig.shifts */
  shiftId: string;
  shiftLabel: string;
  shiftStartTime: string; // HH:MM
  shiftEndTime: string;   // HH:MM
  /** Days of the week this assignment recurs */
  recurringDays: DayOfWeek[];
  /** YYYY-MM-DD */
  effectiveFrom: string;
  /** YYYY-MM-DD — null means ongoing */
  effectiveTo?: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export const SHIFT_ASSIGNMENTS_COLLECTION = "shiftAssignments";
