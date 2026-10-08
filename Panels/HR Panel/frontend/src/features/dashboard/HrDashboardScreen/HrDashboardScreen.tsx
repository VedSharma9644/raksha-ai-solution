import { ActionCard } from "../../../components/ActionCard";
import { NotificationMenu } from "../../notifications";
import { ProfileMenu } from "../../profile";
import type { HrNotification } from "../../notifications";
import type { HrDashboardAction, HrDashboardActionId } from "../dashboardActions";
import { HR_DASHBOARD_ACTIONS } from "../dashboardActions";
import "./HrDashboardScreen.css";

export interface HrDashboardScreenProps {
  notifications: HrNotification[];
  onSelectNotification: (notificationId: string) => void;
  onMarkAllNotificationsRead?: () => void;
  onActionClick: (actionId: HrDashboardActionId) => void;
  /** When set, only these actions are shown (module-gated). */
  actions?: HrDashboardAction[];
}

export function HrDashboardScreen({
  notifications,
  onSelectNotification,
  onMarkAllNotificationsRead,
  onActionClick,
  actions = HR_DASHBOARD_ACTIONS,
}: HrDashboardScreenProps) {
  return (
    <main className="hr-dashboard">
      <header className="hr-dashboard__header">
        <div className="hr-dashboard__brand">
          <p className="hr-dashboard__brand-name">Raskha</p>
          <p className="hr-dashboard__brand-panel">HR Dashboard</p>
        </div>

        <div className="hr-dashboard__toolbar">
          <NotificationMenu
            notifications={notifications}
            onSelectNotification={onSelectNotification}
            onMarkAllRead={onMarkAllNotificationsRead}
          />
          <ProfileMenu />
        </div>
      </header>

      <section className="hr-dashboard__intro" aria-labelledby="hr-heading">
        <h1 id="hr-heading" className="hr-dashboard__headline">
          People operations
        </h1>
        <p className="hr-dashboard__support">
          Manage guards, leave, and inventory stock. Site setup and financial
          details stay outside this panel.
        </p>
      </section>

      <section className="hr-dashboard__actions" aria-label="HR quick actions">
        {actions.length === 0 ? (
          <p className="hr-dashboard__support">
            No modules are enabled for this agency yet. Ask your Agency Admin or
            Raksha Super Admin to enable the features in your plan.
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
