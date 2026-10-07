import { Text, View } from 'react-native';

import { incomingReliefRequestsDefaults } from '../../constants/incoming-relief-requests-defaults';
import { incomingReliefRosterBarStyles as styles } from '../../styles/incoming-relief-roster-bar.styles';

export function IncomingReliefRosterBar() {
  return (
    <View style={styles.bar}>
      <View style={styles.left}>
        <View style={styles.pulseDot} />
        <Text style={styles.rosterText} numberOfLines={1}>
          Active Roster:{' '}
          <Text style={styles.rosterName}>{incomingReliefRequestsDefaults.rosterName}</Text>
          {` (${incomingReliefRequestsDefaults.rosterId})`}
        </Text>
      </View>
      <View style={styles.postChip}>
        <Text style={styles.postText}>{incomingReliefRequestsDefaults.rosterPost}</Text>
      </View>
    </View>
  );
}
