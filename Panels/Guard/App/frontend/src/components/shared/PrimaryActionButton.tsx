import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, Text } from 'react-native';

import { appColors } from '../../theme';
import { sharedPrimaryActionButtonStyles as styles } from '../../styles/shared-primary-action-button.styles';

type PrimaryActionButtonVariant = 'light' | 'emergency';

type PrimaryActionButtonProps = {
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  onPress: () => void;
  variant?: PrimaryActionButtonVariant;
};

export function PrimaryActionButton({
  label,
  icon,
  onPress,
  variant = 'light',
}: PrimaryActionButtonProps) {
  const isEmergency = variant === 'emergency';
  const iconColor = isEmergency ? appColors.onTertiary : appColors.primary;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.base,
        isEmergency ? styles.emergency : styles.light,
        pressed && (isEmergency ? styles.emergencyPressed : styles.lightPressed),
      ]}
      onPress={onPress}
    >
      <MaterialIcons name={icon} size={24} color={iconColor} />
      <Text
        style={isEmergency ? styles.emergencyLabel : styles.lightLabel}
        numberOfLines={2}
      >
        {label}
      </Text>
    </Pressable>
  );
}
