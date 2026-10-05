import { ActionCard } from "../../../components/ActionCard";
import { NotificationMenu } from "../../notifications";
import type { HrNotification } from "../../notifications";
import type { HrDashboardActionId } from "../dashboardActions";
import { HR_DASHBOARD_ACTIONS } from "../dashboardActions";
import "./HrDashboardScreen.css";

export interface HrDashboardScreenProps {
  notifications: HrNotification[];
  onSelectNotification: (notificationId: string) => void;
  onMarkAllNotificationsRead?: () => void;
  onActionClick: (actionId: HrDashboardActionId) => void;
}

export function HrDashboardScreen({
  notifications,
  onSelectNotification,
  onMarkAllNotificationsRead,
  onActionClick,
}: HrDashboardScreenProps) {
  return (
    <main className="hr-dashboard">
      <header className="hr-dashboard__header">
        <div className="hr-dashboard__brand">
          <p className="hr-dashboard__brand-name">Raskha</p>
          <p className="hr-dashboard__brand-panel">HR Dashboard</p>
        </div>

        <NotificationMenu
          notifications={notifications}
          onSelectNotification={onSelectNotification}
          onMarkAllRead={onMarkAllNotificationsRead}
        />
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
        {HR_DASHBOARD_ACTIONS.map((action) => (
          <ActionCard
            key={action.id}
            title={action.title}
            description={action.description}
            icon={action.iconLabel}
            onClick={() => onActionClick(action.id)}
          />
        ))}
      </section>
    </main>
  );
}
