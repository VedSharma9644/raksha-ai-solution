import { useMemo, useState } from 'react';
import { View } from 'react-native';

import {
  leaveRequestCards,
  type LeaveRequestFilter,
} from '../../constants/leave-time-off-defaults';
import { useGuardAppNavigation } from '../../navigation/useGuardAppNavigation';
import { leaveTimeOffScreenStyles as styles } from '../../styles/leave-time-off-screen.styles';
import { LeaveApplyNewButton } from './LeaveApplyNewButton';
import { LeaveBalanceSummaryCard } from './LeaveBalanceSummaryCard';
import { LeaveRequestCard } from './LeaveRequestCard';
import { LeaveRequestFilterTabs } from './LeaveRequestFilterTabs';
import { LeaveUrgentAssistanceCard } from './LeaveUrgentAssistanceCard';

export function LeaveTimeOffScreenContent() {
  const { openApplyForLeave } = useGuardAppNavigation();
  const [activeFilter, setActiveFilter] = useState<LeaveRequestFilter>('all');

  const visibleCards = useMemo(() => {
    if (activeFilter === 'all') {
      return leaveRequestCards;
    }
    return leaveRequestCards.filter((card) => card.status === activeFilter);
  }, [activeFilter]);

  return (
    <View style={styles.content}>
      <LeaveBalanceSummaryCard />
      <LeaveApplyNewButton onPress={openApplyForLeave} />
      <LeaveRequestFilterTabs activeFilter={activeFilter} onChange={setActiveFilter} />

      <View style={styles.cardsList}>
        {visibleCards.map((card) => (
          <LeaveRequestCard key={card.id} item={card} />
        ))}
      </View>

      <View style={styles.urgentWrap}>
        <LeaveUrgentAssistanceCard />
      </View>
    </View>
  );
}
