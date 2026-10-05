export type SubscriberStatus = "active" | "trial" | "expired" | "cancelled";

export interface Subscriber {
  id: string;
  agencyName: string;
  planName: string;
  status: SubscriberStatus;
  seats: number;
  startedOn: string;
  renewsOn: string;
  monthlyValueLabel: string;
}

export const SAMPLE_SUBSCRIBERS: Subscriber[] = [
  {
    id: "sub-1",
    agencyName: "Shield Securitas",
    planName: "Growth",
    status: "active",
    seats: 120,
    startedOn: "2025-11-01",
    renewsOn: "2026-11-01",
    monthlyValueLabel: "₹18,000",
  },
  {
    id: "sub-2",
    agencyName: "NorthGuard Services",
    planName: "Enterprise",
    status: "active",
    seats: 350,
    startedOn: "2025-06-15",
    renewsOn: "2026-06-15",
    monthlyValueLabel: "₹42,000",
  },
  {
    id: "sub-3",
    agencyName: "CityWatch Agency",
    planName: "Starter",
    status: "trial",
    seats: 40,
    startedOn: "2026-09-20",
    renewsOn: "2026-10-20",
    monthlyValueLabel: "₹0 (trial)",
  },
  {
    id: "sub-4",
    agencyName: "SafeZone Protections",
    planName: "Growth",
    status: "expired",
    seats: 80,
    startedOn: "2025-02-01",
    renewsOn: "2026-02-01",
    monthlyValueLabel: "₹18,000",
  },
];
