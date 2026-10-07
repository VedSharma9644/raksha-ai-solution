import { MaterialIcons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { appColors } from '../../theme';
import { homeTodayShiftStatusStyles as styles } from '../../styles/home-today-shift-status.styles';
import { RaisedCard } from '../shared/RaisedCard';
import { StatusPill } from '../shared/StatusPill';

type TodayShiftStatusCardProps = {
  shiftLabel?: string;
  statusBadge?: string;
  timeRange?: string;
  durationLabel?: string;
  statusText?: string;
  countdownLabel?: string;
};

export function TodayShiftStatusCard({
  shiftLabel = "TODAY'S SHIFT • DAY DUTY",
  statusBadge = 'ON DUTY SOON',
  timeRange = '08:00 AM – 08:00 PM',
  durationLabel = '(12 Hours)',
  statusText = 'Check-in Pending',
  countdownLabel = 'Starts in 19 min',
}: TodayShiftStatusCardProps) {
  return (
    <RaisedCard style={styles.card}>
      <View style={styles.accent} />
      <View style={styles.content}>
        <View style={styles.topRow}>
          <View style={styles.shiftLabelRow}>
            <MaterialIcons name="wb-sunny" size={20} color={appColors.primary} />
            <Text style={styles.shiftLabel}>{shiftLabel}</Text>
          </View>
          <StatusPill label={statusBadge} />
        </View>

        <View style={styles.timeRow}>
          <Text style={styles.time}>{timeRange}</Text>
          <Text style={styles.duration}>{durationLabel}</Text>
        </View>

        <View style={styles.statusRow}>
          <View style={styles.statusLeft}>
            <MaterialIcons name="schedule" size={20} color={appColors.secondary} />
            <Text style={styles.statusMuted}>Status:</Text>
            <Text style={styles.statusValue}>{statusText}</Text>
          </View>
          <Text style={styles.countdown}>{countdownLabel}</Text>
        </View>
      </View>
    </RaisedCard>
  );
}
