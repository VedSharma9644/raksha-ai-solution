import { useGuardAppNavigation } from '../../navigation/useGuardAppNavigation';
import { firstNameFromFullName } from '../../utils/shift-display';
import { DutyQuickActionsGrid } from './DutyQuickActionsGrid';
import { EmergencySosPanel } from './EmergencySosPanel';
import { GuardGreetingBanner } from './GuardGreetingBanner';
import { MarkAttendanceHero } from './MarkAttendanceHero';
import { TodayShiftStatusCard } from './TodayShiftStatusCard';

/** All scrollable sections shown on the guard home screen. */
export function HomeScreenContent() {
  const { guardUser } = useGuardAppNavigation();

  return (
    <>
      <GuardGreetingBanner
        guardName={firstNameFromFullName(guardUser?.fullName ?? 'Guard')}
        fullName={guardUser?.fullName}
        photoUri={guardUser?.profilePictureUrl}
        guardId={guardUser?.employeeCode ? `#${guardUser.employeeCode}` : undefined}
        post={guardUser?.postName}
        siteName={guardUser?.siteName || undefined}
        siteDetail={guardUser?.postName || undefined}
      />
      <TodayShiftStatusCard />
      <MarkAttendanceHero />
      <DutyQuickActionsGrid />
      <EmergencySosPanel />
    </>
  );
}
