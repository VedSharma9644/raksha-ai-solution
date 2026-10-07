import { MaterialIcons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import type { UpcomingShiftItem } from '../../constants/upcoming-schedule-defaults';
import { appColors } from '../../theme';
import { scheduleUpcomingShiftCardStyles as styles } from '../../styles/schedule-upcoming-shift-card.styles';
import { TextChevronLink } from '../shared/TextChevronLink';

type ScheduleUpcomingShiftCardProps = {
  shift: UpcomingShiftItem;
};

export function ScheduleUpcomingShiftCard({ shift }: ScheduleUpcomingShiftCardProps) {
  if (shift.kind === 'rest') {
    return (
      <View style={[styles.card, styles.restCard]}>
        <View style={styles.headerRow}>
          <Text style={styles.dayLabel}>{shift.dayLabel}</Text>
          <View style={[styles.statusBadge, styles.statusBadgeRest]}>
            <MaterialIcons name="bed" size={16} color={appColors.primary} />
            <Text style={styles.statusText}>{shift.statusLabel}</Text>
          </View>
        </View>
        <View style={styles.restBody}>
          <View style={styles.restIconWrap}>
            <MaterialIcons name="weekend" size={24} color={appColors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.restTitle}>{shift.restTitle}</Text>
            <Text style={styles.restMessage}>{shift.restMessage}</Text>
          </View>
        </View>
      </View>
    );
  }

  const isNight = shift.kind === 'night';
  const siteIcon = isNight ? 'apartment' : 'business';

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.dayRow}>
          {shift.tomorrowBadge ? (
            <View style={styles.tomorrowBadge}>
              <Text style={styles.tomorrowText}>Tomorrow</Text>
            </View>
          ) : null}
          <Text style={styles.dayLabel} numberOfLines={1}>
            {shift.dayLabel}
          </Text>
        </View>
        <View style={[styles.statusBadge, isNight && styles.statusBadgeNight]}>
          <MaterialIcons
            name={isNight ? 'dark-mode' : 'check-circle'}
            size={16}
            color={isNight ? appColors.onSurface : appColors.primary}
          />
          <Text style={[styles.statusText, isNight && styles.statusTextNight]}>
            {shift.statusLabel}
          </Text>
        </View>
      </View>

      <View style={styles.siteBlock}>
        <View style={styles.siteCol}>
          <View style={styles.siteRow}>
            <MaterialIcons name={siteIcon} size={18} color={appColors.secondary} />
            <Text style={styles.siteName} numberOfLines={1}>
              {shift.siteName}
            </Text>
          </View>
          <Text style={styles.postName} numberOfLines={2}>
            {shift.postName}
          </Text>
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
          <Text style={styles.timeText} numberOfLines={1}>
            {shift.timeLabel}
          </Text>
        </View>
        <TextChevronLink />
      </View>
    </View>
  );
}
