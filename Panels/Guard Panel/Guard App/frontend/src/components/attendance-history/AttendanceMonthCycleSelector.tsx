import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { attendanceHistoryDefaults } from '../../constants/attendance-history-defaults';
import { appColors } from '../../theme';
import { attendanceMonthCycleSelectorStyles as styles } from '../../styles/attendance-month-cycle-selector.styles';

export function AttendanceMonthCycleSelector() {
  return (
    <View style={styles.card}>
      <View style={styles.monthRow}>
        <Pressable style={styles.arrowButton} accessibilityLabel="Previous month">
          <MaterialIcons name="chevron-left" size={24} color={appColors.onSurface} />
        </Pressable>
        <Text style={styles.monthLabel}>{attendanceHistoryDefaults.monthLabel}</Text>
        <Pressable style={styles.arrowButton} accessibilityLabel="Next month">
          <MaterialIcons name="chevron-right" size={24} color={appColors.onSurface} />
        </Pressable>
      </View>
      <Text style={styles.cycleLabel}>{attendanceHistoryDefaults.cycleLabel}</Text>
      <Text style={styles.cycleNote}>{attendanceHistoryDefaults.cycleNote}</Text>
    </View>
  );
}
