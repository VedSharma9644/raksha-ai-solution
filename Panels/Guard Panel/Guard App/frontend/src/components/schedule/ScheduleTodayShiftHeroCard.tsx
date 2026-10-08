import { MaterialIcons } from '@expo/vector-icons';
import { Alert, Pressable, Text, View } from 'react-native';

import { useGuardDutyAssignment } from '../../hooks/useGuardDutyAssignment';
import { useGuardAppNavigation } from '../../navigation/useGuardAppNavigation';
import { appColors } from '../../theme';
import { scheduleTodayShiftHeroStyles as styles } from '../../styles/schedule-today-shift-hero.styles';

export function ScheduleTodayShiftHeroCard() {
  const { openShiftDetails } = useGuardAppNavigation();
  const duty = useGuardDutyAssignment();

  const dutyStatus = duty.shiftActive
    ? duty.punchInStatus?.toLowerCase() === 'late'
      ? 'On Duty • Late login'
      : 'On Duty • Checked-in'
    : duty.isDelayed
      ? 'Delayed • Not at site'
      : duty.statusBadge === 'MISSED'
        ? 'Missed • No check-in'
        : 'Assigned • Check-in pending';

  return (
    <View style={styles.card}>
      <View style={styles.spine} />
      <View style={styles.body}>
        <View style={styles.badgeRow}>
          <View style={styles.todayBadge}>
            <MaterialIcons name="calendar-today" size={16} color={appColors.onPrimary} />
            <Text style={styles.todayBadgeText}>{duty.todayBadge}</Text>
          </View>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>{dutyStatus}</Text>
          </View>
        </View>

        <Text style={styles.siteName}>{duty.siteName}</Text>
        <View style={styles.postRow}>
          <MaterialIcons name="location-on" size={18} color={appColors.primary} />
          <Text style={styles.postText}>{duty.postName}</Text>
        </View>

        <View style={styles.timeCard}>
          <View style={styles.timeLeft}>
            <MaterialIcons name="schedule" size={22} color={appColors.primary} />
            <View>
              <Text style={styles.timeRange}>{duty.timeRange}</Text>
              <Text style={styles.timeMeta}>{duty.dutyType}</Text>
            </View>
          </View>
          <View style={styles.sunCircle}>
            <MaterialIcons
              name={duty.isNight ? 'nights-stay' : 'wb-sunny'}
              size={20}
              color={appColors.primary}
            />
          </View>
        </View>

        <View style={styles.actions}>
          <Pressable style={styles.actionOutline} onPress={openShiftDetails}>
            <MaterialIcons name="info" size={20} color={appColors.primary} />
            <Text style={styles.actionOutlineText}>Shift Details</Text>
          </Pressable>
          <Pressable
            style={styles.actionPrimary}
            onPress={() => Alert.alert('Post Check', 'Post check workflow will open here soon.')}
          >
            <MaterialIcons name="checklist" size={20} color={appColors.onPrimary} />
            <Text style={styles.actionPrimaryText}>Post Check</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
