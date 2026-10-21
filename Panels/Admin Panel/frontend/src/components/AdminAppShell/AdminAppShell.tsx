import { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { APP_ROUTES } from "../../app/routePaths";
import { BranchSelector } from "../BranchSelector";
import { useEnabledModules } from "../../features/modules/useEnabledModules";
import { NotificationMenu } from "../../features/notifications";
import { useAgencyNotifications } from "../../features/notifications/useAgencyNotifications";
import { ProfileMenu } from "../../features/profile";
import { ADMIN_NAV_ITEMS, type AdminNavItem } from "./adminNavConfig";
import "./AdminAppShell.css";

function pathMatches(pathname: string, to: string): boolean {
  if (to === APP_ROUTES.dashboard) {
    return pathname === to;
  }
  return pathname === to || pathname.startsWith(`${to}/`);
}

function isGroupActive(item: AdminNavItem, pathname: string): boolean {
  if (item.to && pathMatches(pathname, item.to)) return true;
  return Boolean(item.children?.some((c) => pathMatches(pathname, c.to)));
}

export function AdminAppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const { hasModule, isActionEnabled, isNotificationActionEnabled } =
    useEnabledModules();
  const {
    notifications,
    markRead,
    markAllRead,
    getAction,
  } = useAgencyNotifications();
  const [navOpen, setNavOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setNavOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    setOpenGroups((prev) => {
      const next = { ...prev };
      for (const item of ADMIN_NAV_ITEMS) {
        if (item.children && isGroupActive(item, location.pathname)) {
          next[item.id] = true;
        }
      }
      return next;
    });
  }, [location.pathname]);

  const visibleItems = useMemo(() => {
    return ADMIN_NAV_ITEMS.filter((item) => {
      if (item.id === "dashboard") return true;
      if (item.actionId === "payment-management") {
        return hasModule("payroll") || hasModule("site_management");
      }
      if (item.actionId === "manage-schedule") {
        return (
          hasModule("attendance") ||
          hasModule("leave") ||
          hasModule("site_management")
        );
      }
      if (item.actionId) {
        return isActionEnabled(item.actionId);
      }
      return true;
    }).map((item) => {
      if (!item.children) return item;
      const children = item.children.filter((child) => {
        if (!child.module) return true;
        return hasModule(child.module);
      });
      return { ...item, children };
    }).filter((item) => !item.children || item.children.length > 0);
  }, [hasModule, isActionEnabled]);

  const visibleNotifications = useMemo(
    () =>
      notifications.filter((n) =>
        isNotificationActionEnabled(getAction(n.id)),
      ),
    [getAction, isNotificationActionEnabled, notifications],
  );

  function handleSelectNotification(notificationId: string) {
    const action = getAction(notificationId);
    markRead(notificationId);
    if (!isNotificationActionEnabled(action)) return;
    if (action === "attendance") {
      navigate(APP_ROUTES.attendance);
      return;
    }
    if (action === "inventory") {
      navigate(APP_ROUTES.inventoryList);
      return;
    }
    if (action === "leave") {
      navigate(APP_ROUTES.manageLeave);
      return;
    }
    if (action === "relief") {
      navigate(APP_ROUTES.manageRelief);
    }
  }

  function toggleGroup(id: string) {
    setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <div
      className={`admin-shell${navOpen ? " admin-shell--nav-open" : ""}`}
    >
      {navOpen ? (
        <button
          type="button"
          className="admin-shell__backdrop"
          aria-label="Close navigation"
          onClick={() => setNavOpen(false)}
        />
      ) : null}

      <header className="admin-shell__topbar">
        <div className="admin-shell__brand">
          <button
            type="button"
            className="admin-shell__menu-btn"
            onClick={() => setNavOpen((v) => !v)}
          >
            Menu
          </button>
          <div className="admin-shell__brand-text">
            <p className="admin-shell__brand-name">Raskha</p>
            <p className="admin-shell__brand-panel">Agency Admin</p>
          </div>
        </div>
        <div className="admin-shell__toolbar">
          <BranchSelector />
          <NotificationMenu
            notifications={visibleNotifications}
            onSelectNotification={handleSelectNotification}
            onMarkAllRead={markAllRead}
          />
          <ProfileMenu />
        </div>
      </header>

      <div className="admin-shell__body">
        <aside className="admin-shell__sidebar" aria-label="Agency navigation">
          <nav className="admin-shell__nav">
            {visibleItems.map((item) => {
              if (item.children && item.children.length > 0) {
                const open = Boolean(openGroups[item.id]);
                return (
                  <div key={item.id}>
                    <button
                      type="button"
                      className={`admin-shell__group-toggle${
                        open || isGroupActive(item, location.pathname)
                          ? " admin-shell__group-toggle--open"
                          : ""
                      }`}
                      aria-expanded={open}
                      onClick={() => toggleGroup(item.id)}
                    >
                      <span>{item.label}</span>
                      <span className="admin-shell__chevron">
                        {open ? "▾" : "▸"}
                      </span>
                    </button>
                    {open ? (
                      <div className="admin-shell__children">
                        {item.children.map((child) => (
                          <NavLink
                            key={child.id}
                            to={child.to}
                            className={({ isActive }) =>
                              `admin-shell__child${
                                isActive ? " admin-shell__child--active" : ""
                              }`
                            }
                            end={child.to === APP_ROUTES.dashboard}
                          >
                            {child.label}
                          </NavLink>
                        ))}
                      </div>
                    ) : null}
                  </div>
                );
              }

              if (!item.to) return null;
              return (
                <NavLink
                  key={item.id}
                  to={item.to}
                  end={item.to === APP_ROUTES.dashboard}
                  className={({ isActive }) =>
                    `admin-shell__link${
                      isActive ? " admin-shell__link--active" : ""
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
        </aside>

        <div className="admin-shell__main">
          <div className="admin-shell__content">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
