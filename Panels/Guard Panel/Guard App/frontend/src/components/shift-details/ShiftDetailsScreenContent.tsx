import { ShiftAssignedPostCard } from './ShiftAssignedPostCard';
import { ShiftCheckoutActions } from './ShiftCheckoutActions';
import { ShiftFieldCommandCard } from './ShiftFieldCommandCard';
import { ShiftReliefHandoverCard } from './ShiftReliefHandoverCard';
import { ShiftSummaryReferenceCard } from './ShiftSummaryReferenceCard';

export function ShiftDetailsScreenContent() {
  return (
    <>
      <ShiftSummaryReferenceCard />
      <ShiftAssignedPostCard />
      <ShiftFieldCommandCard />
      <ShiftReliefHandoverCard />
      <ShiftCheckoutActions />
    </>
  );
}
