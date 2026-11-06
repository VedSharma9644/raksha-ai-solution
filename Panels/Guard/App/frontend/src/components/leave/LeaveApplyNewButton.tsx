import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, Text } from 'react-native';

import { leaveTimeOffDefaults } from '../../constants/leave-time-off-defaults';
import { leaveApplyNewButtonStyles as styles } from '../../styles/leave-apply-new-button.styles';
import { appColors } from '../../theme';

type LeaveApplyNewButtonProps = {
  onPress: () => void;
};

export function LeaveApplyNewButton({ onPress }: LeaveApplyNewButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
      onPress={onPress}
    >
      <MaterialIcons name="event-available" size={24} color={appColors.onPrimary} />
      <Text style={styles.label}>{leaveTimeOffDefaults.applyButtonLabel}</Text>
    </Pressable>
  );
}
