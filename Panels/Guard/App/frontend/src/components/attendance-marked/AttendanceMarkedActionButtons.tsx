import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { attendanceMarkedDefaults } from '../../constants/attendance-marked-defaults';
import { useGuardAppNavigation } from '../../navigation/useGuardAppNavigation';
import { appColors } from '../../theme';
import { attendanceMarkedActionButtonsStyles as styles } from '../../styles/attendance-marked-action-buttons.styles';

export function AttendanceMarkedActionButtons() {
  const { goHome, setMainTab } = useGuardAppNavigation();

  const openSchedule = () => {
    setMainTab('schedule');
  };

  return (
    <View style={styles.section}>
      <Pressable
        style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]}
        onPress={goHome}
      >
        <MaterialIcons name="task-alt" size={24} color={appColors.onPrimary} />
        <Text style={styles.primaryLabel}>{attendanceMarkedDefaults.doneButtonLabel}</Text>
      </Pressable>

      <Pressable
        style={({ pressed }) => [styles.secondaryButton, pressed && styles.secondaryButtonPressed]}
        onPress={openSchedule}
      >
        <MaterialIcons name="calendar-month" size={22} color={appColors.onSurface} />
        <Text style={styles.secondaryLabel}>{attendanceMarkedDefaults.scheduleButtonLabel}</Text>
      </Pressable>
    </View>
  );
}
