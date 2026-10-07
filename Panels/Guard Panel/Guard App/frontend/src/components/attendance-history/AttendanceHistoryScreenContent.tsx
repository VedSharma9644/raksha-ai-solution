import { AttendanceDisputeHelpCard } from './AttendanceDisputeHelpCard';
import { AttendanceHistoryLogSection } from './AttendanceHistoryLogSection';
import { AttendanceMonthCalendarOverview } from './AttendanceMonthCalendarOverview';
import { AttendanceMonthCycleSelector } from './AttendanceMonthCycleSelector';
import { AttendancePunctualityBanner } from './AttendancePunctualityBanner';
import { AttendanceStatsGrid } from './AttendanceStatsGrid';

export function AttendanceHistoryScreenContent() {
  return (
    <>
      <AttendanceMonthCycleSelector />
      <AttendanceStatsGrid />
      <AttendancePunctualityBanner />
      <AttendanceMonthCalendarOverview />
      <AttendanceHistoryLogSection />
      <AttendanceDisputeHelpCard />
    </>
  );
}
