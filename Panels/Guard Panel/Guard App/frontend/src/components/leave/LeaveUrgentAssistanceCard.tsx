import { MaterialIcons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { Pressable, Text, View } from 'react-native';

import { leaveTimeOffDefaults } from '../../constants/leave-time-off-defaults';
import { leaveUrgentAssistanceCardStyles as styles } from '../../styles/leave-urgent-assistance-card.styles';
import { appColors } from '../../theme';

export function LeaveUrgentAssistanceCard() {
  return (
    <View style={styles.card}>
      <View style={styles.titleRow}>
        <MaterialIcons name="contact-support" size={22} color={appColors.primary} />
        <Text style={styles.title}>{leaveTimeOffDefaults.urgentTitle}</Text>
      </View>

      <Text style={styles.message}>{leaveTimeOffDefaults.urgentMessage}</Text>

      <Pressable
        style={({ pressed }) => [styles.callButton, pressed && styles.callButtonPressed]}
        onPress={() => Linking.openURL(`tel:${leaveTimeOffDefaults.callDeskTel}`)}
      >
        <MaterialIcons name="phone-in-talk" size={22} color={appColors.primary} />
        <Text style={styles.callLabel}>{leaveTimeOffDefaults.callDeskLabel}</Text>
      </Pressable>
    </View>
  );
}
