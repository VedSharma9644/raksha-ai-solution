import { Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { sharedStatusPillStyles as styles } from '../../styles/shared-status-pill.styles';

type StatusPillVariant = 'primarySoft' | 'idBadge' | 'warning' | 'danger' | 'success';

type StatusPillProps = {
  label: string;
  variant?: StatusPillVariant;
  style?: StyleProp<ViewStyle>;
};

export function StatusPill({ label, variant = 'primarySoft', style }: StatusPillProps) {
  const variantStyle =
    variant === 'idBadge'
      ? styles.idBadge
      : variant === 'warning'
        ? styles.warning
        : variant === 'danger'
          ? styles.danger
          : variant === 'success'
            ? styles.success
            : styles.primarySoft;

  const labelStyle =
    variant === 'warning'
      ? [styles.label, styles.warningLabel]
      : variant === 'danger'
        ? [styles.label, styles.dangerLabel]
        : variant === 'success'
          ? [styles.label, styles.successLabel]
          : [styles.label, styles.primarySoftLabel];

  return (
    <View style={[styles.base, variantStyle, style]}>
      <Text style={labelStyle}>{label}</Text>
    </View>
  );
}
