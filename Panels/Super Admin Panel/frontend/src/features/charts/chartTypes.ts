export interface ChartPoint {
  label: string;
  value: number;
}

export interface PlatformMetrics {
  totalAgencies: number;
  activeSubscribers: number;
  trialAgencies: number;
  enabledFeatureToggles: number;
}

export const SAMPLE_PLATFORM_METRICS: PlatformMetrics = {
  totalAgencies: 4,
  activeSubscribers: 2,
  trialAgencies: 1,
  enabledFeatureToggles: 15,
};

export const SAMPLE_AGENCY_GROWTH: ChartPoint[] = [
  { label: "May", value: 1 },
  { label: "Jun", value: 2 },
  { label: "Jul", value: 2 },
  { label: "Aug", value: 3 },
  { label: "Sep", value: 3 },
  { label: "Oct", value: 4 },
];

export const SAMPLE_FEATURE_USAGE: ChartPoint[] = [
  { label: "Attendance", value: 3 },
  { label: "Leave", value: 3 },
  { label: "Inventory", value: 2 },
  { label: "Payroll", value: 1 },
  { label: "Sites", value: 1 },
  { label: "Reports", value: 2 },
];

export const SAMPLE_SUBSCRIPTION_MIX: ChartPoint[] = [
  { label: "Active", value: 2 },
  { label: "Trial", value: 1 },
  { label: "Expired", value: 1 },
];
