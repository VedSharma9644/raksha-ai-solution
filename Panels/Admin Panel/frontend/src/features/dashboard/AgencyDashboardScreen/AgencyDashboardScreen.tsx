import { ActionCard } from "../../../components/ActionCard";
import { BranchSelector } from "../../../components/BranchSelector";
import { NotificationMenu } from "../../notifications";
import { ProfileMenu } from "../../profile";
import type { AgencyNotification } from "../../notifications";
import type { DashboardAction, DashboardActionId } from "../dashboardActions";
import { DASHBOARD_ACTIONS } from "../dashboardActions";
import "./AgencyDashboardScreen.css";

export interface AgencyDashboardScreenProps {
  notifications: AgencyNotification[];
  onSelectNotification: (notificationId: string) => void;
  onMarkAllNotificationsRead?: () => void;
  onActionClick: (actionId: DashboardActionId) => void;
  /** When set, only these actions are shown (module-gated). */
  actions?: DashboardAction[];
}

export function AgencyDashboardScreen({
  notifications,
  onSelectNotification,
  onMarkAllNotificationsRead,
  onActionClick,
  actions = DASHBOARD_ACTIONS,
}: AgencyDashboardScreenProps) {
  return (
    <main className="agency-dashboard">
      <header className="agency-dashboard__header">
        <div className="agency-dashboard__brand">
          <p className="agency-dashboard__brand-name">Raskha</p>
          <p className="agency-dashboard__brand-panel">Agency Dashboard</p>
        </div>

        <div className="agency-dashboard__toolbar">
          <BranchSelector />
          <NotificationMenu
            notifications={notifications}
            onSelectNotification={onSelectNotification}
            onMarkAllRead={onMarkAllNotificationsRead}
          />
          <ProfileMenu />
        </div>
      </header>

      <section
        className="agency-dashboard__intro"
        aria-labelledby="dashboard-heading"
      >
        <h1 id="dashboard-heading" className="agency-dashboard__headline">
          Operations hub
        </h1>
        <p className="agency-dashboard__support">
          Jump into the tasks you use most. More modules can plug into this
          board as the agency grows.
        </p>
      </section>

      <section
        className="agency-dashboard__actions"
        aria-label="Agency quick actions"
      >
        {actions.length === 0 ? (
          <p className="agency-dashboard__support">
            No modules are enabled for this agency yet. Ask Raksha Super Admin to
            turn on the features included in your plan.
          </p>
        ) : (
          actions.map((action) => (
            <ActionCard
              key={action.id}
              title={action.title}
              description={action.description}
              icon={action.iconLabel}
              onClick={() => onActionClick(action.id)}
            />
          ))
        )}
      </section>
    </main>
  );
}
