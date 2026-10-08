import { MaterialIcons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, Text, View } from 'react-native';

import {
  fetchReliefRequests,
  withdrawReliefRequest,
  type ReliefRequestCardDto,
} from '../../api/guard-api';
import {
  incomingReliefRequestsDefaults,
  type IncomingReliefTab,
} from '../../constants/incoming-relief-requests-defaults';
import { useGuardAppNavigation } from '../../navigation/useGuardAppNavigation';
import { incomingReliefRequestsScreenStyles as styles } from '../../styles/incoming-relief-requests-screen.styles';
import { appColors } from '../../theme';
import { IncomingEmergencySupportCard } from './IncomingEmergencySupportCard';
import { IncomingReliefIncentiveBanner } from './IncomingReliefIncentiveBanner';
import { IncomingReliefRosterBar } from './IncomingReliefRosterBar';
import { IncomingReliefTabSwitcher } from './IncomingReliefTabSwitcher';

function ReliefHistoryCard({
  item,
  onWithdraw,
  withdrawing,
}: {
  item: ReliefRequestCardDto;
  onWithdraw?: () => void;
  withdrawing?: boolean;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardStatus}>{item.statusLabel}</Text>
        <Text style={styles.cardMeta}>{item.methodLabel}</Text>
      </View>
      <Text style={styles.cardTitle}>
        {item.isAssignment
          ? `Cover for ${item.requesterName ?? 'colleague'}`
          : item.reasonLabel}
      </Text>
      <Text style={styles.cardDetail}>
        {item.dutyDate} • {item.timeRangeLabel}
      </Text>
      <Text style={styles.cardDetail}>
        {item.siteName}
        {item.postName ? ` • ${item.postName}` : ''}
      </Text>
      {item.assignedGuardName ? (
        <Text style={styles.cardDetail}>Assigned: {item.assignedGuardName}</Text>
      ) : null}
      {item.rejectionRemark ? (
        <Text style={styles.cardDetail}>Remark: {item.rejectionRemark}</Text>
      ) : null}
      {item.status === 'pending' && onWithdraw ? (
        <Pressable
          style={styles.withdrawButton}
          disabled={withdrawing}
          onPress={onWithdraw}
        >
          <Text style={styles.withdrawLabel}>
            {withdrawing ? 'Withdrawing…' : 'Withdraw request'}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function IncomingReliefRequestsScreenContent() {
  const { authToken } = useGuardAppNavigation();
  const [activeTab, setActiveTab] = useState<IncomingReliefTab>('incoming');
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<ReliefRequestCardDto[]>([]);
  const [assignments, setAssignments] = useState<ReliefRequestCardDto[]>([]);
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!authToken) {
      setRequests([]);
      setAssignments([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await fetchReliefRequests(authToken, 'all');
      setRequests(data.requests ?? []);
      setAssignments(data.assignments ?? []);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to load relief requests.';
      Alert.alert('Relief', message);
    } finally {
      setLoading(false);
    }
  }, [authToken]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleWithdraw = async (id: string) => {
    if (!authToken) {
      return;
    }
    setWithdrawingId(id);
    try {
      await withdrawReliefRequest(authToken, id);
      await load();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to withdraw request.';
      Alert.alert('Relief', message);
    } finally {
      setWithdrawingId(null);
    }
  };

  return (
    <View style={styles.content}>
      <IncomingReliefRosterBar />
      <IncomingReliefTabSwitcher
        activeTab={activeTab}
        onChange={setActiveTab}
        incomingCount={assignments.length}
        sentCount={requests.length}
      />
      <IncomingReliefIncentiveBanner />

      {loading ? (
        <ActivityIndicator color={appColors.primary} style={{ marginVertical: 24 }} />
      ) : activeTab === 'incoming' ? (
        <View style={styles.feed}>
          {assignments.length === 0 ? (
            <Text style={styles.emptyText}>
              No relief duties assigned to you yet. Admin/HR will notify you when you are
              assigned to cover a shift.
            </Text>
          ) : (
            assignments.map((item) => <ReliefHistoryCard key={item.id} item={item} />)
          )}
        </View>
      ) : (
        <View style={styles.feed}>
          {requests.length === 0 ? (
            <Text style={styles.emptyText}>
              You have not sent any relief requests yet.
            </Text>
          ) : (
            requests.map((item) => (
              <ReliefHistoryCard
                key={item.id}
                item={item}
                withdrawing={withdrawingId === item.id}
                onWithdraw={
                  item.status === 'pending'
                    ? () => {
                        void handleWithdraw(item.id);
                      }
                    : undefined
                }
              />
            ))
          )}
        </View>
      )}

      <View style={styles.historyBlock}>
        <Text style={styles.historyTitle}>{incomingReliefRequestsDefaults.historyTitle}</Text>
        <Text style={styles.emptyText}>
          Approved and rejected requests appear under My Sent. Assigned covers appear under
          Incoming.
        </Text>
      </View>

      <IncomingEmergencySupportCard />
    </View>
  );
}
