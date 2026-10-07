import { Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { sharedStatusPillStyles as styles } from '../../styles/shared-status-pill.styles';

type StatusPillVariant = 'primarySoft' | 'idBadge';

type StatusPillProps = {
  label: string;
  variant?: StatusPillVariant;
  style?: StyleProp<ViewStyle>;
};

export function StatusPill({ label, variant = 'primarySoft', style }: StatusPillProps) {
  const variantStyle = variant === 'idBadge' ? styles.idBadge : styles.primarySoft;
  const labelStyle =
    variant === 'idBadge'
      ? [styles.label, styles.primarySoftLabel]
      : [styles.label, styles.primarySoftLabel];

  return (
    <View style={[styles.base, variantStyle, style]}>
      <Text style={labelStyle}>{label}</Text>
    </View>
  );
}
