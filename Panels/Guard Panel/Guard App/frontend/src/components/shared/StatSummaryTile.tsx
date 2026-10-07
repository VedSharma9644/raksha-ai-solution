import { MaterialIcons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { appColors } from '../../theme';
import { sharedStatSummaryTileStyles as styles } from '../../styles/shared-stat-summary-tile.styles';

type StatSummaryTileProps = {
  value: string;
  label: string;
  subtitle: string;
  icon: keyof typeof MaterialIcons.glyphMap;
};

export function StatSummaryTile({ value, label, subtitle, icon }: StatSummaryTileProps) {
  return (
    <View style={styles.tile}>
      <View style={styles.iconWrap}>
        <MaterialIcons name={icon} size={20} color={appColors.primary} />
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}
