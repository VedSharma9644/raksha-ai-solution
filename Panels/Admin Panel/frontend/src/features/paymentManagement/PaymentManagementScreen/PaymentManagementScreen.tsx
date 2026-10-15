import { ActionCard } from "../../../components/ActionCard";
import { AppScreenLayout } from "../../../components/AppScreenLayout";
import { PageHeader } from "../../../components/PageHeader";
import "./PaymentManagementScreen.css";

export type PaymentManagementOptionId =
  | "payroll"
  | "earnings"
  | "invoices"
  | "money-out";

export type PaymentManagementOption = {
  id: PaymentManagementOptionId;
  title: string;
  description: string;
  icon: string;
};

export interface PaymentManagementScreenProps {
  options: PaymentManagementOption[];
  onBack: () => void;
  onOpen: (id: PaymentManagementOptionId) => void;
}

export function PaymentManagementScreen({
  options,
  onBack,
  onOpen,
}: PaymentManagementScreenProps) {
  return (
    <AppScreenLayout>
      <div className="app-screen-layout__content payment-management-screen">
        <PageHeader
          title="Payment management"
          subtitle="Payroll, client billing, earnings, and money out — pick a workspace."
          onBack={onBack}
          backLabel="Back to dashboard"
        />

        {options.length === 0 ? (
          <p className="payment-management-screen__empty">
            No payment modules are enabled for this agency yet.
          </p>
        ) : (
          <section
            className="payment-management-screen__options"
            aria-label="Payment workspaces"
          >
            {options.map((option) => (
              <ActionCard
                key={option.id}
                title={option.title}
                description={option.description}
                icon={option.icon}
                onClick={() => onOpen(option.id)}
              />
            ))}
          </section>
        )}
      </div>
    </AppScreenLayout>
  );
}
