import { ShiftAssignedPostCard } from './ShiftAssignedPostCard';
import { ShiftCheckoutActions } from './ShiftCheckoutActions';
import { ShiftFieldCommandCard } from './ShiftFieldCommandCard';
import { ShiftGpsLiveBanner } from './ShiftGpsLiveBanner';
import { ShiftReliefHandoverCard } from './ShiftReliefHandoverCard';
import { ShiftSummaryReferenceCard } from './ShiftSummaryReferenceCard';

export function ShiftDetailsScreenContent() {
  return (
    <>
      <ShiftGpsLiveBanner />
      <ShiftSummaryReferenceCard />
      <ShiftAssignedPostCard />
      <ShiftFieldCommandCard />
      <ShiftReliefHandoverCard />
      <ShiftCheckoutActions />
    </>
  );
}
