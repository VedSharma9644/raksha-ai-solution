import { MaterialIcons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { Alert, Text, View } from 'react-native';

import {
  formatPhoneDisplay,
  toTelHref,
  useGuardProfile,
} from '../../hooks/useGuardProfile';
import { appColors } from '../../theme';
import { homeEmergencySosPanelStyles as styles } from '../../styles/home-emergency-sos-panel.styles';
import { PrimaryActionButton } from '../shared/PrimaryActionButton';

export function EmergencySosPanel() {
  const { profile } = useGuardProfile();
  const hrName = profile?.site.hrName?.trim() || 'Site HR';
  const hrContact = profile?.site.hrContact?.trim() || '';
  const hrTel = toTelHref(hrContact);

  const triggerSos = () => {
    Alert.alert(
      'ARE YOU IN AN EMERGENCY?',
      hrTel
        ? `Call ${hrName} (${formatPhoneDisplay(hrContact)}) for immediate assistance.`
        : 'Site HR phone is not on file. Contact your agency desk immediately.',
      [
        { text: 'Cancel', style: 'cancel' },
        ...(hrTel
          ? [
              {
                text: `Call ${hrName}`,
                style: 'destructive' as const,
                onPress: () => {
                  void Linking.openURL(`tel:${hrTel}`);
                },
              },
            ]
          : []),
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
