import { Text, View } from 'react-native';

import { useGuardDutyAssignment } from '../../hooks/useGuardDutyAssignment';
import { useGuardAppNavigation } from '../../navigation/useGuardAppNavigation';
import { incomingReliefRosterBarStyles as styles } from '../../styles/incoming-relief-roster-bar.styles';

export function IncomingReliefRosterBar() {
  const { guardUser } = useGuardAppNavigation();
  const duty = useGuardDutyAssignment();
  const name = guardUser?.fullName?.trim() || 'Guard';
  const code = guardUser?.employeeCode?.trim() || '—';

  return (
    <View style={styles.bar}>
      <View style={styles.left}>
        <View style={styles.pulseDot} />
        <Text style={styles.rosterText}>
          Active Roster: <Text style={styles.rosterName}>{name}</Text>
          {` (${code})`}
        </Text>
      </View>
      <View style={styles.postChip}>
        <Text style={styles.postText}>{duty.postName}</Text>
      </View>
    </View>
  );
}
