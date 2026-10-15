import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { APP_ROUTES } from "../app/routePaths";
import { useEnabledModules } from "../features/modules/useEnabledModules";
import {
  ManageScheduleScreen,
  type ManageScheduleOption,
  type ManageScheduleOptionId,
} from "../features/manageSchedule";

const ALL_OPTIONS: ManageScheduleOption[] = [
  {
    id: "attendance",
    title: "Attendance",
    description: "View daily punch-in and punch-out records for all guards.",
    icon: "📋",
  },
  {
    id: "manage-leave",
    title: "Manage leave",
    description: "Review, approve, or reject leave requests from guards.",
    icon: "V",
  },
  {
    id: "manage-relief",
    title: "Manage relief",
    description:
      "Approve remaining-shift handovers and assign a replacement guard.",
    icon: "R",
  },
  {
    id: "scheduling",
    title: "Scheduling",
    description:
      "Manage guard shift assignments and view weekly or monthly rosters per site.",
    icon: "📅",
  },
];

export function ManageSchedulePage() {
  const navigate = useNavigate();
  const { hasModule } = useEnabledModules();

  const options = useMemo(
    () =>
      ALL_OPTIONS.filter((option) => {
        if (option.id === "attendance") return hasModule("attendance");
        if (option.id === "manage-leave" || option.id === "manage-relief") {
          return hasModule("leave");
        }
        return hasModule("site_management");
      }),
    [hasModule]
  );

  function handleOpen(id: ManageScheduleOptionId) {
    if (id === "attendance") {
      navigate(APP_ROUTES.attendance);
      return;
    }
    if (id === "manage-leave") {
      navigate(APP_ROUTES.manageLeave);
      return;
    }
    if (id === "manage-relief") {
      navigate(APP_ROUTES.manageRelief);
      return;
    }
    navigate(APP_ROUTES.siteList, { state: { from: "manage-schedule" } });
  }

  return (
    <ManageScheduleScreen
      options={options}
      onBack={() => navigate(APP_ROUTES.dashboard)}
      onOpen={handleOpen}
    />
  );
}
