import { MaterialIcons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { Pressable, Text, View } from 'react-native';

import { incomingReliefRequestsDefaults } from '../../constants/incoming-relief-requests-defaults';
import { incomingEmergencySupportCardStyles as styles } from '../../styles/incoming-emergency-support-card.styles';
import { appColors } from '../../theme';

export function IncomingEmergencySupportCard() {
  return (
    <View style={styles.card}>
      <View style={styles.titleRow}>
        <View style={styles.iconCircle}>
          <MaterialIcons name="support-agent" size={20} color={appColors.onTertiaryFixed} />
        </View>
        <Text style={styles.title}>{incomingReliefRequestsDefaults.emergencyTitle}</Text>
      </View>

      <Text style={styles.message}>{incomingReliefRequestsDefaults.emergencyMessage}</Text>

      <View style={styles.actionsRow}>
        <Pressable
          style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
          onPress={() => Linking.openURL(`tel:${incomingReliefRequestsDefaults.supervisorTel}`)}
        >
          <MaterialIcons name="person" size={18} color={appColors.primary} />
          <Text style={styles.supervisorLabel}>
            {incomingReliefRequestsDefaults.supervisorCallLabel}
          </Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
          onPress={() => Linking.openURL(`tel:${incomingReliefRequestsDefaults.tollFreeTel}`)}
        >
          <MaterialIcons name="emergency" size={18} color={appColors.tertiary} />
          <Text style={styles.tollFreeLabel}>{incomingReliefRequestsDefaults.tollFreeLabel}</Text>
        </Pressable>
      </View>
    </View>
  );
}
