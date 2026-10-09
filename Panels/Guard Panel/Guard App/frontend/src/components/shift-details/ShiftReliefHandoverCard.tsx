import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { useGuardDutyAssignment } from '../../hooks/useGuardDutyAssignment';
import { useGuardAppNavigation } from '../../navigation/useGuardAppNavigation';
import { appColors } from '../../theme';
import { formatShiftClock } from '../../utils/shift-display';
import { shiftReliefHandoverCardStyles as styles } from '../../styles/shift-relief-handover-card.styles';

export function ShiftReliefHandoverCard() {
  const { openRelieveAGuard } = useGuardAppNavigation();
  const duty = useGuardDutyAssignment();

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <MaterialIcons name="published-with-changes" size={24} color={appColors.primary} />
          <Text style={styles.headerTitle}>Relief & Handover</Text>
        </View>
        <Text style={styles.squadLabel}>Request</Text>
      </View>

      <View style={styles.profileRow}>
        <View
          style={[
            styles.photo,
            {
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: appColors.secondaryContainer,
            },
          ]}
        >
          <MaterialIcons name="swap-horiz" size={32} color={appColors.primary} />
        </View>
        <View style={styles.copy}>
          <Text style={styles.name} numberOfLines={1}>
            Need cover for this shift?
          </Text>
          <Text style={styles.guardId}>
            Shift ends {formatShiftClock(duty.shiftTo || '20:00')}
          </Text>
          <View style={styles.reliefWindow}>
            <MaterialIcons name="access-time" size={18} color={appColors.primary} />
            <Text style={styles.reliefWindowText}>
              Submit a relief request to HR for approval
            </Text>
          </View>
        </View>
      </View>

      <Pressable
        style={({ pressed }) => [styles.requestButton, pressed && styles.requestButtonPressed]}
        onPress={openRelieveAGuard}
      >
        <MaterialIcons name="swap-horiz" size={22} color={appColors.onSecondaryContainer} />
        <Text style={styles.requestButtonText}>Request Relief / Leave Cover</Text>
      </Pressable>
    </View>
  );
}
