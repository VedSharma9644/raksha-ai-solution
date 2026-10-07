import { MaterialIcons } from '@expo/vector-icons';
import { Alert, Text, View } from 'react-native';

import { appColors } from '../../theme';
import { homeEmergencySosPanelStyles as styles } from '../../styles/home-emergency-sos-panel.styles';
import { PrimaryActionButton } from '../shared/PrimaryActionButton';

export function EmergencySosPanel() {
  const triggerSos = () => {
    Alert.alert(
      'ARE YOU IN AN EMERGENCY?',
      'This will instantly dispatch immediate backup and alert Supervisor Amit Singh & Central Command.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm SOS',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'SOS Alert Dispatched',
              'Stand by your post if safe. Emergency contacts have received your GPS coordinates.',
            );
          },
        },
      ],
    );
  };

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.warningIcon}>
          <MaterialIcons name="warning" size={28} color={appColors.onTertiary} />
        </View>
        <View style={styles.copy}>
          <Text style={styles.title}>EMERGENCY ASSISTANCE</Text>
          <Text style={styles.description}>
            Tap if you need immediate supervisor & central control room backup
          </Text>
        </View>
      </View>

      <PrimaryActionButton
        label="SOS Emergency (Requires Confirmation)"
        icon="emergency"
        onPress={triggerSos}
        variant="emergency"
      />
    </View>
  );
}
