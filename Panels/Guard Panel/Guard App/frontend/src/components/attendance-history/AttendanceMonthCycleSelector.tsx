import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { appColors } from '../../theme';
import { attendanceMonthCycleSelectorStyles as styles } from '../../styles/attendance-month-cycle-selector.styles';

type AttendanceMonthCycleSelectorProps = {
  monthLabel: string;
  cycleLabel: string;
  cycleNote: string;
  onPrev: () => void;
  onNext: () => void;
};

export function AttendanceMonthCycleSelector({
  monthLabel,
  cycleLabel,
  cycleNote,
  onPrev,
  onNext,
}: AttendanceMonthCycleSelectorProps) {
  return (
    <View style={styles.card}>
      <View style={styles.monthRow}>
        <Pressable
          style={styles.arrowButton}
          accessibilityLabel="Previous month"
          onPress={onPrev}
        >
          <MaterialIcons name="chevron-left" size={24} color={appColors.onSurface} />
        </Pressable>
        <Text style={styles.monthLabel}>{monthLabel}</Text>
        <Pressable
          style={styles.arrowButton}
          accessibilityLabel="Next month"
          onPress={onNext}
        >
          <MaterialIcons name="chevron-right" size={24} color={appColors.onSurface} />
        </Pressable>
      </View>
      <Text style={styles.cycleLabel}>{cycleLabel}</Text>
      <Text style={styles.cycleNote}>{cycleNote}</Text>
    </View>
  );
}
