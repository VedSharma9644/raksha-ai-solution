import { AttendanceMarkedActionButtons } from './AttendanceMarkedActionButtons';
import { AttendanceMarkedDetailsCard } from './AttendanceMarkedDetailsCard';
import { AttendanceMarkedSuccessHero } from './AttendanceMarkedSuccessHero';
import { AttendanceRosterDispatchBanner } from './AttendanceRosterDispatchBanner';

export function AttendanceMarkedScreenContent() {
  return (
    <>
      <AttendanceMarkedSuccessHero />
      <AttendanceMarkedDetailsCard />
      <AttendanceRosterDispatchBanner />
      <AttendanceMarkedActionButtons />
    </>
  );
}
