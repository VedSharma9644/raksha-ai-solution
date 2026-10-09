import { MaterialIcons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import type {
  UpcomingDutyStatus,
  UpcomingShiftItem,
} from '../../constants/upcoming-schedule-defaults';
import { appColors } from '../../theme';
import { scheduleUpcomingShiftCardStyles as styles } from '../../styles/schedule-upcoming-shift-card.styles';
import { TextChevronLink } from '../shared/TextChevronLink';

type ScheduleUpcomingShiftCardProps = {
  shift: UpcomingShiftItem;
};

function statusIcon(
  dutyStatus: UpcomingDutyStatus | undefined,
  isNight: boolean,
): keyof typeof MaterialIcons.glyphMap {
  switch (dutyStatus) {
    case 'on_duty':
      return 'verified';
    case 'delayed':
      return 'schedule';
    case 'coming':
      return 'directions-walk';
    case 'completed':
      return 'check-circle';
    case 'missed':
      return 'error-outline';
    default:
      return isNight ? 'dark-mode' : 'event-available';
  }
}

export function ScheduleUpcomingShiftCard({ shift }: ScheduleUpcomingShiftCardProps) {
  if (shift.kind === 'rest') {
    return (
      <View style={[styles.card, styles.restCard]}>
        <View style={styles.headerRow}>
          <View style={styles.dayRow}>
            {shift.todayBadge ? (
              <View style={styles.todayBadge}>
                <Text style={styles.todayText}>Today</Text>
              </View>
            ) : null}
            <Text style={styles.dayLabel}>{shift.dayLabel}</Text>
          </View>
          <View style={[styles.statusBadge, styles.statusBadgeRest]}>
            <MaterialIcons name="bed" size={16} color={appColors.primary} />
            <Text style={styles.statusText}>{shift.statusLabel}</Text>
          </View>
        </View>
        <View style={styles.restBody}>
          <View style={styles.restIconWrap}>
            <MaterialIcons name="weekend" size={24} color={appColors.primary} />
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={styles.restTitle}>{shift.restTitle}</Text>
            <Text style={styles.restMessage}>{shift.restMessage}</Text>
          </View>
        </View>
      </View>
    );
  }

  const isNight = shift.kind === 'night';
  const siteIcon = isNight ? 'apartment' : 'business';
  const dutyStatus = shift.dutyStatus ?? 'scheduled';
  const statusBadgeStyle = [
    styles.statusBadge,
    dutyStatus === 'on_duty' && styles.statusBadgeOnDuty,
    dutyStatus === 'delayed' && styles.statusBadgeDelayed,
    dutyStatus === 'coming' && styles.statusBadgeComing,
    dutyStatus === 'completed' && styles.statusBadgeCompleted,
    dutyStatus === 'missed' && styles.statusBadgeMissed,
    dutyStatus === 'scheduled' && isNight && styles.statusBadgeNight,
  ];
  const statusTextStyle = [
    styles.statusText,
    dutyStatus === 'on_duty' && styles.statusTextOnDuty,
    dutyStatus === 'delayed' && styles.statusTextDelayed,
    dutyStatus === 'coming' && styles.statusTextComing,
    dutyStatus === 'completed' && styles.statusTextCompleted,
    dutyStatus === 'missed' && styles.statusTextMissed,
    dutyStatus === 'scheduled' && isNight && styles.statusTextNight,
  ];
  const iconColor =
    dutyStatus === 'on_duty'
      ? '#065f46'
      : dutyStatus === 'delayed' || dutyStatus === 'missed'
        ? appColors.error
        : dutyStatus === 'coming'
          ? appColors.primaryContainer
          : isNight
            ? appColors.onSurface
            : appColors.primary;

  return (
    <View style={[styles.card, shift.todayBadge && styles.todayCard]}>
      <View style={styles.headerRow}>
        <View style={styles.dayRow}>
          {shift.todayBadge ? (
            <View style={styles.todayBadge}>
              <Text style={styles.todayText}>Today</Text>
            </View>
          ) : null}
          {shift.tomorrowBadge && !shift.todayBadge ? (
            <View style={styles.tomorrowBadge}>
              <Text style={styles.tomorrowText}>Tomorrow</Text>
            </View>
          ) : null}
          <Text style={styles.dayLabel}>{shift.dayLabel}</Text>
        </View>
        <View style={statusBadgeStyle}>
          <MaterialIcons
            name={statusIcon(dutyStatus, isNight)}
            size={16}
            color={iconColor}
          />
          <Text style={statusTextStyle}>{shift.statusLabel}</Text>
        </View>
      </View>

      <View style={styles.siteBlock}>
        <View style={styles.siteCol}>
          <View style={styles.siteRow}>
            <MaterialIcons name={siteIcon} size={18} color={appColors.secondary} />
            <Text style={styles.siteName}>{shift.siteName}</Text>
          </View>
          <Text style={styles.postName}>{shift.postName}</Text>
        </View>
        <MaterialIcons
          name={isNight ? 'nightlight' : 'wb-sunny'}
          size={24}
          color={isNight ? appColors.primary : appColors.secondary}
        />
      </View>

      {shift.nightAllowanceLabel ? (
        <View style={styles.allowanceChip}>
          <MaterialIcons name="currency-rupee" size={18} color={appColors.primaryContainer} />
          <Text style={styles.allowanceText}>{shift.nightAllowanceLabel}</Text>
        </View>
      ) : null}

      <View style={styles.footerRow}>
        <View style={styles.timeRow}>
          <MaterialIcons name="schedule" size={18} color={appColors.secondary} />
          <Text style={styles.timeText}>{shift.timeLabel}</Text>
        </View>
        <TextChevronLink />
      </View>
    </View>
  );
}
