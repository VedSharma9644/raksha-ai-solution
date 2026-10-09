import { MaterialIcons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import type { AttendanceHistoryLogDto } from '../../api/guard-api';
import { appColors } from '../../theme';
import { attendanceDailyLogCardStyles as styles } from '../../styles/attendance-daily-log-card.styles';

type AttendanceDailyLogCardProps = {
  item: AttendanceHistoryLogDto;
};

function statusStyles(kind: AttendanceHistoryLogDto['kind']) {
  switch (kind) {
    case 'onDuty':
      return { badge: styles.statusOnDuty, text: styles.statusTextOnDuty };
    case 'half':
      return { badge: styles.statusHalf, text: styles.statusTextHalf };
    case 'missed':
      return { badge: styles.statusMissed, text: styles.statusTextMissed };
    case 'upcoming':
      return { badge: styles.statusUpcoming, text: styles.statusTextUpcoming };
    case 'weeklyOff':
    case 'leave':
      return { badge: styles.statusOff, text: styles.statusTextOff };
    case 'full':
    case 'present':
    default:
      return { badge: styles.statusPresent, text: styles.statusTextPresent };
  }
}

export function AttendanceDailyLogCard({ item }: AttendanceDailyLogCardProps) {
  const status = statusStyles(item.kind);
  const isOff = item.kind === 'weeklyOff' || item.kind === 'leave';
  const isMissed = item.kind === 'missed';
  const hasDetails = Boolean(item.detailPrimaryValue);

  return (
    <View
      style={[
        styles.card,
        isOff && styles.cardOff,
        isMissed && styles.cardMissed,
      ]}
    >
      <View style={styles.headerRow}>
        <View style={[styles.statusBadge, status.badge]}>
          <Text style={[styles.statusText, status.text]}>{item.statusLabel}</Text>
        </View>
        <Text style={styles.dateLabel}>{item.dateLabel}</Text>
      </View>

      <View style={styles.postRow}>
        <MaterialIcons
          name={item.postIcon}
          size={20}
          color={isMissed ? appColors.error : appColors.primary}
        />
        <Text style={styles.postLabel}>{item.postLabel}</Text>
      </View>

      {hasDetails ? (
        <View style={styles.detailsBox}>
          <View style={styles.detailCol}>
            <Text style={styles.detailLabel}>{item.detailPrimaryLabel}</Text>
            <Text style={styles.detailValue}>{item.detailPrimaryValue}</Text>
          </View>
          {item.detailSecondaryValue ? (
            <View style={styles.detailCol}>
              <Text style={styles.detailLabel}>{item.detailSecondaryLabel}</Text>
              <Text style={styles.detailValue}>{item.detailSecondaryValue}</Text>
            </View>
          ) : null}
          {item.detailTertiaryValue ? (
            <View style={styles.detailCol}>
              <Text style={styles.detailLabel}>{item.detailTertiaryLabel}</Text>
              <Text style={styles.detailValue}>{item.detailTertiaryValue}</Text>
            </View>
          ) : null}
        </View>
      ) : null}

      <View style={styles.footerRow}>
        {item.footerTags.map((tag) => (
          <Text key={tag} style={styles.footerTag}>
            {tag}
          </Text>
        ))}
      </View>
    </View>
  );
}
