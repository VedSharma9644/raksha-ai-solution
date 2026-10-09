import { MaterialIcons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { Alert, Pressable, Text, View } from 'react-native';

import {
  type LeaveRequestCard as LeaveRequestCardData,
} from '../../constants/leave-time-off-defaults';
import {
  toTelHref,
  useGuardProfile,
} from '../../hooks/useGuardProfile';
import { leaveRequestCardStyles as styles } from '../../styles/leave-request-card.styles';
import { appColors } from '../../theme';

type LeaveRequestCardProps = {
  item: LeaveRequestCardData;
  onWithdraw?: (id: string) => void;
  withdrawing?: boolean;
};

function statusVisuals(status: LeaveRequestCardData['status']) {
  if (status === 'pending') {
    return {
      bar: styles.statusBarPending,
      badge: styles.statusBadgePending,
      badgeText: styles.statusBadgeTextPending,
      icon: 'hourglass-top' as const,
      iconColor: '#78350f',
    };
  }
  if (status === 'approved') {
    return {
      bar: styles.statusBarApproved,
      badge: styles.statusBadgeApproved,
      badgeText: styles.statusBadgeTextApproved,
      icon: 'check-circle' as const,
      iconColor: '#064e3b',
    };
  }
  return {
    bar: styles.statusBarRejected,
    badge: styles.statusBadgeRejected,
    badgeText: styles.statusBadgeTextRejected,
    icon: 'cancel' as const,
    iconColor: appColors.onErrorContainer,
  };
}

export function LeaveRequestCard({ item, onWithdraw, withdrawing }: LeaveRequestCardProps) {
  const { profile } = useGuardProfile();
  const hrName = profile?.site.hrName?.trim() || 'Site HR';
  const hrTel = toTelHref(profile?.site.hrContact?.trim() || '');
  const visuals = statusVisuals(item.status);
  const isRejected = item.status === 'rejected';
  const hasRichApproval = Boolean(item.approvalNote && item.approvalDetail);

  const confirmWithdraw = () => {
    Alert.alert(
      'Withdraw request',
      'Cancel this pending leave request? Your supervisor will no longer see it.',
      [
        { text: 'Keep', style: 'cancel' },
        {
          text: 'Withdraw',
          style: 'destructive',
          onPress: () => onWithdraw?.(item.id),
        },
      ],
    );
  };

  return (
    <View style={styles.card}>
      <View style={[styles.statusBar, visuals.bar]} />

      <View style={styles.headerRow}>
        <View style={[styles.statusBadge, visuals.badge]}>
          <MaterialIcons name={visuals.icon} size={16} color={visuals.iconColor} />
          <Text style={[styles.statusBadgeText, visuals.badgeText]}>{item.statusLabel}</Text>
        </View>
        <Text style={styles.duration}>{item.durationLabel}</Text>
      </View>

      <View style={styles.dateBlock}>
        <Text style={styles.dateRange}>{item.dateRange}</Text>
        <Text style={[styles.leaveType, isRejected && styles.leaveTypeMuted]}>
          {item.leaveTypeLabel}
        </Text>
      </View>

      <View style={[styles.reasonBlock, isRejected && styles.reasonBlockAlt]}>
        <Text style={[styles.reasonLabel, isRejected && styles.reasonLabelAlt]}>
          {item.rejectionLabel ?? 'Reason Provided'}
        </Text>
        <Text style={styles.reasonText}>{`"${item.reasonText}"`}</Text>
      </View>

      {item.appliedMeta || item.supervisorMeta ? (
        <View style={styles.metaBlock}>
          {item.appliedMeta ? (
            <View style={styles.metaRow}>
              <MaterialIcons name="schedule" size={18} color={appColors.secondary} />
              <Text style={styles.metaText}>{item.appliedMeta}</Text>
            </View>
          ) : null}
          {item.supervisorMeta ? (
            <View style={styles.metaRow}>
              <MaterialIcons name="person" size={18} color={appColors.primary} />
              <Text style={styles.metaTextStrong}>{item.supervisorMeta}</Text>
            </View>
          ) : null}
        </View>
      ) : null}

      {hasRichApproval ? (
        <View style={styles.approvalBlock}>
          <View style={styles.approvalRow}>
            <MaterialIcons name="verified" size={18} color="#064e3b" />
            <Text style={styles.approvalNote}>{item.approvalNote}</Text>
          </View>
          {item.approvalDetail ? (
            <Text style={styles.approvalDetail}>{item.approvalDetail}</Text>
          ) : null}
        </View>
      ) : null}

      {item.approvalNote && !item.approvalDetail ? (
        <View style={styles.approvalSimpleRow}>
          <MaterialIcons name="task-alt" size={18} color="#047857" />
          <Text style={styles.approvalSimpleText}>{item.approvalNote}</Text>
        </View>
      ) : null}

      {item.compensationNote ? (
        <View style={styles.compensationRow}>
          <MaterialIcons name="payments" size={20} color={appColors.primary} />
          <Text style={styles.compensationText}>{item.compensationNote}</Text>
        </View>
      ) : null}

      {item.showPendingActions ? (
        <View style={styles.actionsRow}>
          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              styles.withdrawButton,
              pressed && styles.actionPressed,
              withdrawing && { opacity: 0.6 },
            ]}
            onPress={confirmWithdraw}
            disabled={withdrawing}
          >
            <MaterialIcons name="cancel" size={18} color={appColors.tertiary} />
            <Text style={styles.withdrawLabel}>{withdrawing ? 'Withdrawing…' : 'Withdraw'}</Text>
          </Pressable>

          {hrTel ? (
            <Pressable
              style={({ pressed }) => [
                styles.actionButton,
                styles.callButton,
                pressed && styles.actionPressed,
              ]}
              onPress={() => Linking.openURL(`tel:${hrTel}`)}
            >
              <MaterialIcons name="call" size={18} color={appColors.onPrimary} />
              <Text style={styles.callLabel}>Call {hrName}</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
