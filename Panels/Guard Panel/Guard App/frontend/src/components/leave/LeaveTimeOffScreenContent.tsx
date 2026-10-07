import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Text, View } from 'react-native';

import {
  fetchLeaveRequests,
  withdrawLeaveRequest,
  type LeaveRequestCardDto,
  type LeaveRequestsResponse,
} from '../../api/guard-api';
import type { LeaveRequestFilter } from '../../constants/leave-time-off-defaults';
import { useGuardAppNavigation } from '../../navigation/useGuardAppNavigation';
import { leaveTimeOffScreenStyles as styles } from '../../styles/leave-time-off-screen.styles';
import { appColors } from '../../theme';
import { LeaveApplyNewButton } from './LeaveApplyNewButton';
import { LeaveBalanceSummaryCard } from './LeaveBalanceSummaryCard';
import { LeaveRequestCard } from './LeaveRequestCard';
import { LeaveRequestFilterTabs } from './LeaveRequestFilterTabs';
import { LeaveUrgentAssistanceCard } from './LeaveUrgentAssistanceCard';

export function LeaveTimeOffScreenContent() {
  const { openApplyForLeave, authToken } = useGuardAppNavigation();
  const [activeFilter, setActiveFilter] = useState<LeaveRequestFilter>('all');
  const [data, setData] = useState<LeaveRequestsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!authToken) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const result = await fetchLeaveRequests(authToken, 'all');
      setData(result);
    } catch (error: unknown) {
      const err = error as { message?: string };
      Alert.alert('Leave history', err.message ?? 'Could not load leave requests.');
    } finally {
      setLoading(false);
    }
  }, [authToken]);

  useEffect(() => {
    void load();
  }, [load]);

  const visibleCards = useMemo(() => {
    const requests = data?.requests ?? [];
    if (activeFilter === 'all') {
      return requests;
    }
    return requests.filter((card) => card.status === activeFilter);
  }, [activeFilter, data?.requests]);

  const handleWithdraw = async (id: string) => {
    if (!authToken) {
      return;
    }
    setWithdrawingId(id);
    try {
      const result = await withdrawLeaveRequest(authToken, id);
      await load();
      Alert.alert('Withdrawn', result.message);
    } catch (error: unknown) {
      const err = error as { message?: string };
      Alert.alert('Withdraw failed', err.message ?? 'Please try again.');
    } finally {
      setWithdrawingId(null);
    }
  };

  if (loading && !data) {
    return (
      <View style={[styles.content, { paddingTop: 40, alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={appColors.primary} />
        <Text style={{ marginTop: 12, color: appColors.secondary }}>Loading leave history…</Text>
      </View>
    );
  }

  return (
    <View style={styles.content}>
      <LeaveBalanceSummaryCard balance={data?.balance} />
      <LeaveApplyNewButton onPress={openApplyForLeave} />
      <LeaveRequestFilterTabs
        activeFilter={activeFilter}
        onChange={setActiveFilter}
        counts={data?.filterCounts}
      />

      <View style={styles.cardsList}>
        {visibleCards.length === 0 ? (
          <Text style={{ color: appColors.secondary, textAlign: 'center', paddingVertical: 24 }}>
            No leave requests in this filter yet.
          </Text>
        ) : (
          visibleCards.map((card: LeaveRequestCardDto) => (
            <LeaveRequestCard
              key={card.id}
              item={card}
              onWithdraw={(requestId) => {
                void handleWithdraw(requestId);
              }}
              withdrawing={withdrawingId === card.id}
            />
          ))
        )}
      </View>

      <View style={styles.urgentWrap}>
        <LeaveUrgentAssistanceCard />
      </View>
    </View>
  );
}
