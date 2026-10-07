import { MaterialIcons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { Alert, Pressable, Text, View } from 'react-native';

import { attendanceHistoryDefaults } from '../../constants/attendance-history-defaults';
import { appColors } from '../../theme';
import { attendanceDisputeHelpCardStyles as styles } from '../../styles/attendance-dispute-help-card.styles';

export function AttendanceDisputeHelpCard() {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{attendanceHistoryDefaults.disputeTitle}</Text>

      <Pressable
        style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]}
        onPress={() => Linking.openURL(`tel:${attendanceHistoryDefaults.callSupervisorTel}`)}
      >
        <MaterialIcons name="call" size={22} color={appColors.onPrimary} />
        <Text style={styles.primaryLabel}>{attendanceHistoryDefaults.callSupervisorLabel}</Text>
      </Pressable>

      <Pressable
        style={({ pressed }) => [styles.secondaryButton, pressed && styles.secondaryButtonPressed]}
        onPress={() =>
          Alert.alert(
            'Attendance Correction',
            'Attendance correction request will open here soon.',
          )
        }
      >
        <MaterialIcons name="flag" size={22} color={appColors.onSurface} />
        <Text style={styles.secondaryLabel}>{attendanceHistoryDefaults.raiseCorrectionLabel}</Text>
      </Pressable>
    </View>
  );
}
