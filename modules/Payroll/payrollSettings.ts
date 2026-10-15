/** Firestore collection — one doc per agency (`payrollSettings/{agencyId}`). */
export const PAYROLL_SETTINGS_COLLECTION = "payrollSettings";

export const WEEKDAY_IDS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

export type WeekdayId = (typeof WEEKDAY_IDS)[number];

export const WEEKDAY_LABELS: Record<WeekdayId, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

export type DaySalaryMethod = "calendar_month" | "working_days";

export type HalfShiftDeduction =
  | "half_day"
  | "full_day"
  | "custom_percent";

export type PayrollCoveredRoles = "guards" | "guards_and_hr";

/**
 * Agency-level payroll defaults used for day-salary math and later payroll runs.
 * Which weekday(s) are off is per guard (not agency-wide) — store empty weeklyOffDays.
 */
export interface PayrollGeneralSettings {
  agencyId: string;
  /** How many weekly offs each employee gets (agency default). */
  weeklyOffCount: number;
  /**
   * Legacy / unused at agency level. Weekly off *days* are per guard.
   * Kept for older docs; new saves use [].
   */
  weeklyOffDays: WeekdayId[];
  casualLeavePerYear: number;
  medicalLeavePerYear: number;
  leaveCarryForward: boolean;
  /** Used only when leaveCarryForward is true. */
  leaveCarryForwardMaxDays: number;
  daySalaryMethod: DaySalaryMethod;
  halfShiftDeduction: HalfShiftDeduction;
  /** 0–100; used when halfShiftDeduction === "custom_percent". */
  halfShiftCustomPercent: number;
  /** Day of month the pay cycle starts (1–28). */
  payCycleStartDay: number;
  overtimePaid: boolean;
  overtimeMultiplier: number;
  deductLateEarly: boolean;
  deductPfEsi: boolean;
  coveredRoles: PayrollCoveredRoles;
}

export const DEFAULT_PAYROLL_GENERAL_SETTINGS: Omit<
  PayrollGeneralSettings,
  "agencyId"
> = {
  weeklyOffCount: 1,
  weeklyOffDays: [],
  casualLeavePerYear: 12,
  medicalLeavePerYear: 6,
  leaveCarryForward: false,
  leaveCarryForwardMaxDays: 0,
  daySalaryMethod: "calendar_month",
  halfShiftDeduction: "half_day",
  halfShiftCustomPercent: 50,
  payCycleStartDay: 1,
  overtimePaid: false,
  overtimeMultiplier: 1.5,
  deductLateEarly: false,
  deductPfEsi: false,
  coveredRoles: "guards",
};

export function defaultPayrollSettings(
  agencyId: string
): PayrollGeneralSettings {
  return {
    agencyId,
    ...DEFAULT_PAYROLL_GENERAL_SETTINGS,
  };
}

function asNumber(value: unknown, fallback: number): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return fallback;
}

function asBool(value: unknown, fallback: boolean): boolean {
  if (typeof value === "boolean") return value;
  return fallback;
}

export interface NormalizePayrollSettingsResult {
  settings: PayrollGeneralSettings;
  errors: string[];
  warnings: string[];
}

/** Normalize + validate a PUT body. */
export function normalizePayrollSettings(
  agencyId: string,
  raw: unknown
): NormalizePayrollSettingsResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const input =
    raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const defaults = defaultPayrollSettings(agencyId);

  const weeklyOffCount = Math.round(
    asNumber(input.weeklyOffCount, defaults.weeklyOffCount)
  );
  if (weeklyOffCount < 0 || weeklyOffCount > 7) {
    errors.push("Weekly offs must be a number from 0 to 7.");
  }

  // Agency settings only store how many offs; which day is per guard.
  const weeklyOffDays: WeekdayId[] = [];

  const casualLeavePerYear = Math.round(
    asNumber(input.casualLeavePerYear, defaults.casualLeavePerYear)
  );
  if (casualLeavePerYear < 0 || casualLeavePerYear > 366) {
    errors.push("Casual leave per year must be between 0 and 366.");
  }

  const medicalLeavePerYear = Math.round(
    asNumber(input.medicalLeavePerYear, defaults.medicalLeavePerYear)
  );
  if (medicalLeavePerYear < 0 || medicalLeavePerYear > 366) {
    errors.push("Medical leave per year must be between 0 and 366.");
  }

  const leaveCarryForward = asBool(
    input.leaveCarryForward,
    defaults.leaveCarryForward
  );
  let leaveCarryForwardMaxDays = Math.round(
    asNumber(input.leaveCarryForwardMaxDays, defaults.leaveCarryForwardMaxDays)
  );
  if (!leaveCarryForward) {
    leaveCarryForwardMaxDays = 0;
  } else if (leaveCarryForwardMaxDays < 0 || leaveCarryForwardMaxDays > 366) {
    errors.push("Max carry-over leave days must be between 0 and 366.");
  }

  const daySalaryMethodRaw = input.daySalaryMethod;
  const daySalaryMethod: DaySalaryMethod =
    daySalaryMethodRaw === "working_days" ||
    daySalaryMethodRaw === "calendar_month"
      ? daySalaryMethodRaw
      : defaults.daySalaryMethod;

  const halfRaw = input.halfShiftDeduction;
  const halfShiftDeduction: HalfShiftDeduction =
    halfRaw === "half_day" ||
    halfRaw === "full_day" ||
    halfRaw === "custom_percent"
      ? halfRaw
      : defaults.halfShiftDeduction;

  let halfShiftCustomPercent = asNumber(
    input.halfShiftCustomPercent,
    defaults.halfShiftCustomPercent
  );
  if (halfShiftDeduction === "custom_percent") {
    if (halfShiftCustomPercent < 0 || halfShiftCustomPercent > 100) {
      errors.push("Custom half-shift cut must be between 0 and 100%.");
    }
  } else if (halfShiftDeduction === "half_day") {
    halfShiftCustomPercent = 50;
  } else {
    halfShiftCustomPercent = 100;
  }

  const payCycleStartDay = Math.round(
    asNumber(input.payCycleStartDay, defaults.payCycleStartDay)
  );
  if (payCycleStartDay < 1 || payCycleStartDay > 28) {
    errors.push("Pay month start date must be between 1 and 28.");
  }

  const overtimePaid = asBool(input.overtimePaid, defaults.overtimePaid);
  let overtimeMultiplier = asNumber(
    input.overtimeMultiplier,
    defaults.overtimeMultiplier
  );
  if (overtimePaid) {
    if (overtimeMultiplier < 1 || overtimeMultiplier > 5) {
      errors.push("Overtime rate must be between 1× and 5×.");
    }
  } else {
    overtimeMultiplier = defaults.overtimeMultiplier;
  }

  const deductLateEarly = asBool(
    input.deductLateEarly,
    defaults.deductLateEarly
  );
  const deductPfEsi = asBool(input.deductPfEsi, defaults.deductPfEsi);

  const coveredRaw = input.coveredRoles;
  const coveredRoles: PayrollCoveredRoles =
    coveredRaw === "guards_and_hr" || coveredRaw === "guards"
      ? coveredRaw
      : defaults.coveredRoles;

  return {
    settings: {
      agencyId,
      weeklyOffCount,
      weeklyOffDays,
      casualLeavePerYear,
      medicalLeavePerYear,
      leaveCarryForward,
      leaveCarryForwardMaxDays,
      daySalaryMethod,
      halfShiftDeduction,
      halfShiftCustomPercent,
      payCycleStartDay,
      overtimePaid,
      overtimeMultiplier,
      deductLateEarly,
      deductPfEsi,
      coveredRoles,
    },
    errors,
    warnings,
  };
}

/** Merge stored doc with defaults (supports older partial docs). */
export function mergePayrollSettings(
  agencyId: string,
  stored: Partial<PayrollGeneralSettings> | null | undefined
): PayrollGeneralSettings {
  const base = defaultPayrollSettings(agencyId);
  if (!stored || typeof stored !== "object") return base;
  const { settings } = normalizePayrollSettings(agencyId, { ...base, ...stored });
  return settings;
}
