import { MaterialIcons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { Alert, Pressable, Text, View } from 'react-native';

import { scheduleTodayShiftDefaults } from '../../constants/schedule-today-shift-defaults';
import { upcomingScheduleDefaults } from '../../constants/upcoming-schedule-defaults';
import { useGuardAppNavigation } from '../../navigation/useGuardAppNavigation';
import { appColors } from '../../theme';
import { scheduleTodayShiftHeroStyles as styles } from '../../styles/schedule-today-shift-hero.styles';

export function ScheduleTodayShiftHeroCard() {
  const { openShiftDetails } = useGuardAppNavigation();

  return (
    <View style={styles.card}>
      <View style={styles.spine} />
      <View style={styles.body}>
        <View style={styles.badgeRow}>
          <View style={styles.todayBadge}>
            <MaterialIcons name="calendar-today" size={16} color={appColors.onPrimary} />
            <Text style={styles.todayBadgeText}>{scheduleTodayShiftDefaults.todayBadge}</Text>
          </View>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>{scheduleTodayShiftDefaults.dutyStatus}</Text>
          </View>
        </View>

        <Text style={styles.siteName}>{scheduleTodayShiftDefaults.siteName}</Text>
        <View style={styles.postRow}>
          <MaterialIcons name="location-on" size={18} color={appColors.primary} />
          <Text style={styles.postText}>{scheduleTodayShiftDefaults.postName}</Text>
        </View>

        <View style={styles.timeCard}>
          <View style={styles.timeLeft}>
            <MaterialIcons name="schedule" size={22} color={appColors.primary} />
            <View>
              <Text style={styles.timeRange}>{scheduleTodayShiftDefaults.timeRange}</Text>
              <Text style={styles.timeMeta}>{scheduleTodayShiftDefaults.dutyType}</Text>
            </View>
          </View>
          <View style={styles.sunCircle}>
            <MaterialIcons name="wb-sunny" size={20} color={appColors.primary} />
          </View>
        </View>

        <View style={styles.supervisorRow}>
          <View style={styles.supervisorLeft}>
            <View style={styles.supervisorIcon}>
              <MaterialIcons name="security" size={18} color={appColors.onSecondaryContainer} />
            </View>
            <View>
              <Text style={styles.supervisorName}>{upcomingScheduleDefaults.supervisorName}</Text>
              <Text style={styles.supervisorRole}>{upcomingScheduleDefaults.supervisorRole}</Text>
            </View>
          </View>
          <Pressable
            style={styles.callButton}
            onPress={() => Linking.openURL(`tel:${upcomingScheduleDefaults.supervisorPhone}`)}
          >
            <MaterialIcons name="phone" size={18} color={appColors.primary} />
            <Text style={styles.callText}>Call</Text>
          </Pressable>
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
