import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { relieveAGuardDefaults } from '../../constants/relieve-a-guard-defaults';
import { useGuardDutyAssignment } from '../../hooks/useGuardDutyAssignment';
import { useGuardAppNavigation } from '../../navigation/useGuardAppNavigation';
import { relieveShiftHandoverCardStyles as styles } from '../../styles/relieve-shift-handover-card.styles';
import { appColors } from '../../theme';
import { toIstDutyDateKey } from '../../utils/ist-date';
import { firstNameFromFullName } from '../../utils/shift-display';

type RelieveShiftHandoverCardProps = {
  dutyDate: string;
  onCycleDutyDate: () => void;
};

export function RelieveShiftHandoverCard({
  dutyDate,
  onCycleDutyDate,
}: RelieveShiftHandoverCardProps) {
  const duty = useGuardDutyAssignment();
  const { guardUser } = useGuardAppNavigation();
  const firstName = firstNameFromFullName(guardUser?.fullName ?? 'Guard');
  const today = toIstDutyDateKey();
  const dateLabel =
    dutyDate === today
      ? duty.todayBadge || 'Today (IST)'
      : `Duty ${dutyDate}`;

  return (
    <View style={styles.section}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={styles.stepBadge}>
            <Text style={styles.stepBadgeText}>1</Text>
          </View>
          <Text style={styles.stepTitle}>{relieveAGuardDefaults.step1Title}</Text>
        </View>
        <Pressable
          style={styles.changeButton}
          onPress={onCycleDutyDate}
          accessibilityRole="button"
          accessibilityLabel="Toggle relief duty date between today and tomorrow"
        >
          <Text style={styles.changeLabel}>{dateLabel}</Text>
          <MaterialIcons name="calendar-month" size={18} color={appColors.primary} />
        </Pressable>
      </View>

      <View style={styles.card}>
        <View style={styles.statusSpine} />

        <View style={styles.statusRow}>
          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusBadgeText}>{relieveAGuardDefaults.shiftStatusBadge}</Text>
          </View>
          <Text style={styles.whenLabel}>{duty.shiftLabel}</Text>
        </View>

        <Text style={styles.date}>
          {firstName} • {duty.dutyType}
        </Text>

        <View style={styles.timeRow}>
          <MaterialIcons
            name={duty.isNight ? 'nights-stay' : 'wb-sunny'}
            size={22}
            color={appColors.primary}
          />
          <Text style={styles.timeText}>{duty.timeRange}</Text>
          {duty.durationLabel ? (
            <View style={styles.durationBadge}>
              <Text style={styles.durationText}>{duty.durationLabel}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.siteBlock}>
          <MaterialIcons name="location-on" size={24} color={appColors.primaryContainer} />
          <View style={styles.siteCopy}>
            <Text style={styles.siteName}>{duty.siteName}</Text>
            <Text style={styles.postLabel}>Post: {duty.postName}</Text>
          </View>
        </View>

        <View style={styles.footerRow}>
          <View style={styles.eligibleRow}>
            <MaterialIcons name="verified-user" size={18} color={appColors.primary} />
            <Text style={styles.eligibleText}>{relieveAGuardDefaults.reliefEligibleLabel}</Text>
          </View>
          <Text style={styles.supervisorText}>Awaiting Admin/HR</Text>
        </View>
      </View>
    </View>
  );
}
