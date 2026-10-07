import { MaterialIcons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { appColors } from '../../theme';
import { sharedDetailInfoRowStyles as styles } from '../../styles/shared-detail-info-row.styles';

type DetailInfoRowProps = {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  title: string;
  subtitle?: string;
  titleVariant?: 'title' | 'headline';
  statusBadge?: string;
};

export function DetailInfoRow({
  icon,
  label,
  title,
  subtitle,
  titleVariant = 'title',
  statusBadge,
}: DetailInfoRowProps) {
  const titleStyle = titleVariant === 'headline' ? styles.headlineTitle : styles.title;

  return (
    <View style={styles.row}>
      <View style={styles.iconWrap}>
        <MaterialIcons name={icon} size={22} color={appColors.primary} />
      </View>

      <View style={styles.copy}>
        <Text style={styles.label}>{label}</Text>
        {statusBadge ? (
          <View style={styles.titleRow}>
            <Text style={titleStyle}>{title} </Text>
            <View style={styles.inlineBadge}>
              <Text style={styles.inlineBadgeText}>{statusBadge}</Text>
            </View>
          </View>
        ) : (
          <Text style={titleStyle}>{title}</Text>
        )}
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}
