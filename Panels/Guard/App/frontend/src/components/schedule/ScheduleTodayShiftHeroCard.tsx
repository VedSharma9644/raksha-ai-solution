import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { useGuardDutyAssignment } from '../../hooks/useGuardDutyAssignment';
import { useGuardAppNavigation } from '../../navigation/useGuardAppNavigation';
import { appColors } from '../../theme';
import { scheduleTodayShiftHeroStyles as styles } from '../../styles/schedule-today-shift-hero.styles';

export function ScheduleTodayShiftHeroCard() {
  const { openShiftDetails } = useGuardAppNavigation();
  const duty = useGuardDutyAssignment();

  const lateLogin =
    duty.punchInStatus?.toLowerCase() === 'late' ||
    duty.punchInStatus?.toLowerCase() === 'late login';
  const dutyStatus = duty.shiftActive
    ? lateLogin
      ? 'On Duty\nLate Login'
      : 'On Duty'
    : duty.isDelayed
      ? 'Delayed'
      : duty.statusBadge === 'MISSED'
        ? 'Missed'
        : 'Coming';

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
            <Text style={styles.liveText}>{dutyStatus}</Text>
          </View>
        </View>

        <Text style={styles.siteName} numberOfLines={2}>
          {duty.siteName}
        </Text>
        {duty.postName && duty.postName !== 'Assigned post' ? (
          <View style={styles.postRow}>
            <MaterialIcons name="location-on" size={18} color={appColors.primary} />
            <Text style={styles.postText} numberOfLines={2}>
              {duty.postName}
            </Text>
          </View>
        ) : null}

        <View style={styles.timeCard}>
          <View style={styles.timeLeft}>
            <MaterialIcons name="schedule" size={22} color={appColors.primary} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.timeRange}>{duty.timeRange}</Text>
              {duty.durationLabel ? (
                <Text style={styles.timeMeta}>{duty.durationLabel.replace(/[()]/g, '')}</Text>
              ) : null}
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

        <Pressable style={styles.actionOutline} onPress={openShiftDetails}>
          <MaterialIcons name="info" size={20} color={appColors.primary} />
          <Text style={styles.actionOutlineText}>View details</Text>
          <MaterialIcons name="chevron-right" size={20} color={appColors.primary} />
        </Pressable>
      </View>
    </View>
  );
}
