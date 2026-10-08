import { MaterialIcons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { useGuardDutyAssignment } from '../../hooks/useGuardDutyAssignment';
import { appColors } from '../../theme';
import { homeTodayShiftStatusStyles as styles } from '../../styles/home-today-shift-status.styles';
import { RaisedCard } from '../shared/RaisedCard';
import { StatusPill } from '../shared/StatusPill';

export function TodayShiftStatusCard() {
  const duty = useGuardDutyAssignment();
  const iconName = duty.isNight ? 'nights-stay' : 'wb-sunny';

  return (
    <RaisedCard style={styles.card}>
      <View style={styles.accent} />
      <View style={styles.content}>
        <View style={styles.topRow}>
          <View style={styles.shiftLabelRow}>
            <MaterialIcons name={iconName} size={20} color={appColors.primary} />
            <Text style={styles.shiftLabel}>{duty.shiftLabel}</Text>
          </View>
          <StatusPill
            label={duty.statusBadge}
            variant={
              duty.badgeTone === 'danger'
                ? 'danger'
                : duty.badgeTone === 'warning'
                  ? 'warning'
                  : duty.badgeTone === 'success'
                    ? 'success'
                    : 'primarySoft'
            }
          />
        </View>

        <View style={styles.timeRow}>
          <Text style={styles.time}>{duty.timeRange}</Text>
          {duty.durationLabel ? (
            <Text style={styles.duration}>{duty.durationLabel}</Text>
          ) : null}
        </View>

        <Text style={styles.statusMuted}>
          {duty.siteName}
          {duty.postName ? ` • ${duty.postName}` : ''}
        </Text>

        <View style={styles.statusRow}>
          <View style={styles.statusLeft}>
            <MaterialIcons name="schedule" size={20} color={appColors.secondary} />
            <Text style={styles.statusMuted}>Status:</Text>
            <Text style={styles.statusValue}>{duty.statusText}</Text>
          </View>
          {duty.countdownLabel ? (
            <Text style={styles.countdown}>{duty.countdownLabel}</Text>
          ) : null}
        </View>
      </View>
    </RaisedCard>
  );
}
