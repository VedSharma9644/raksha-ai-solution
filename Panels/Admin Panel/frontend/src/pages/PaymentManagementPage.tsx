import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { APP_ROUTES } from "../app/routePaths";
import { useEnabledModules } from "../features/modules/useEnabledModules";
import {
  PaymentManagementScreen,
  type PaymentManagementOption,
  type PaymentManagementOptionId,
} from "../features/paymentManagement";

const ALL_OPTIONS: PaymentManagementOption[] = [
  {
    id: "payroll",
    title: "Payroll",
    description:
      "Generate monthly pay, review attendance breakdowns, and mark salaries paid.",
    icon: "₹",
  },
  {
    id: "earnings",
    title: "Earnings",
    description:
      "See client money in from sites vs guard pay out, with profit and loss by site.",
    icon: "E",
  },
  {
    id: "invoices",
    title: "Invoices",
    description:
      "Draft monthly site invoices from assigned headcount and client rates, then print or download PDF.",
    icon: "Inv",
  },
  {
    id: "money-out",
    title: "Money out",
    description:
      "Log employee advances with payroll recovery and day-to-day expenses.",
    icon: "MO",
  },
];

const OPTION_ROUTES: Record<PaymentManagementOptionId, string> = {
  payroll: APP_ROUTES.payroll,
  earnings: APP_ROUTES.earnings,
  invoices: APP_ROUTES.invoices,
  "money-out": APP_ROUTES.moneyOut,
};

export function PaymentManagementPage() {
  const navigate = useNavigate();
  const { hasModule } = useEnabledModules();

  const options = useMemo(
    () =>
      ALL_OPTIONS.filter((option) => {
        if (option.id === "payroll") return hasModule("payroll");
        return hasModule("site_management");
      }),
    [hasModule]
  );

  return (
    <PaymentManagementScreen
      options={options}
      onBack={() => navigate(APP_ROUTES.dashboard)}
      onOpen={(id) => navigate(OPTION_ROUTES[id])}
    />
  );
}
