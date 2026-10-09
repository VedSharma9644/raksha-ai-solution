import {
  toTelHref,
  useGuardProfile,
} from '../../hooks/useGuardProfile';
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
  const { profile } = useGuardProfile();

  const siteName =
    profile?.site.siteName?.trim() ||
    guardUser?.siteName?.trim() ||
    undefined;
  const postName =
    profile?.site.postName?.trim() ||
    guardUser?.postName?.trim() ||
    undefined;
  const hrName = profile?.site.hrName?.trim() || undefined;
  const hrPhone = toTelHref(profile?.site.hrContact?.trim() || '') || undefined;

  return (
    <>
      <GuardGreetingBanner
        guardName={firstNameFromFullName(guardUser?.fullName ?? 'Guard')}
        fullName={guardUser?.fullName}
        photoUri={guardUser?.profilePictureUrl}
        guardId={guardUser?.employeeCode || undefined}
        post={postName}
        siteName={siteName}
        siteDetail={postName}
        hrName={hrName}
        hrPhone={hrPhone}
      />
      <TodayShiftStatusCard />
      <MarkAttendanceHero />
      <DutyQuickActionsGrid />
      <EmergencySosPanel />
    </>
  );
}
