import { GuardGreetingBanner } from './GuardGreetingBanner';
import { TodayShiftStatusCard } from './TodayShiftStatusCard';
import { MarkAttendanceHero } from './MarkAttendanceHero';
import { DutyQuickActionsGrid } from './DutyQuickActionsGrid';
import { EmergencySosPanel } from './EmergencySosPanel';

/** All scrollable sections shown on the guard home screen. */
export function HomeScreenContent() {
  return (
    <>
      <GuardGreetingBanner />
      <TodayShiftStatusCard />
      <MarkAttendanceHero />
      <DutyQuickActionsGrid />
      <EmergencySosPanel />
    </>
  );
}
