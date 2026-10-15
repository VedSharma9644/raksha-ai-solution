import { ActionCard } from "../../../components/ActionCard";
import { AppScreenLayout } from "../../../components/AppScreenLayout";
import { PageHeader } from "../../../components/PageHeader";
import "./ManageScheduleScreen.css";

export type ManageScheduleOptionId =
  | "attendance"
  | "manage-leave"
  | "manage-relief"
  | "scheduling";

export type ManageScheduleOption = {
  id: ManageScheduleOptionId;
  title: string;
  description: string;
  icon: string;
};

export interface ManageScheduleScreenProps {
  options: ManageScheduleOption[];
  onBack: () => void;
  onOpen: (id: ManageScheduleOptionId) => void;
}

export function ManageScheduleScreen({
  options,
  onBack,
  onOpen,
}: ManageScheduleScreenProps) {
  return (
    <AppScreenLayout>
      <div className="app-screen-layout__content manage-schedule-screen">
        <PageHeader
          title="Manage schedule"
          subtitle="Attendance, leave, relief, and site rosters — pick a workspace."
          onBack={onBack}
          backLabel="Back to dashboard"
        />

        {options.length === 0 ? (
          <p className="manage-schedule-screen__empty">
            No schedule modules are enabled for this agency yet.
          </p>
        ) : (
          <section
            className="manage-schedule-screen__options"
            aria-label="Schedule workspaces"
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
