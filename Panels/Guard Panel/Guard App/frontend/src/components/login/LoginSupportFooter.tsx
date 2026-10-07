import { MaterialIcons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { Pressable, Text, View } from 'react-native';

import { loginScreenDefaults } from '../../constants/login-screen-defaults';
import { loginSupportFooterStyles as styles } from '../../styles/login-support-footer.styles';
import { appColors } from '../../theme';

export function LoginSupportFooter() {
  return (
    <View style={styles.footer}>
      <View style={styles.assistanceRow}>
        <Pressable
          style={({ pressed }) => [styles.assistChip, pressed && styles.assistChipPressed]}
          onPress={() => Linking.openURL(`tel:${loginScreenDefaults.controlRoomTel}`)}
        >
          <MaterialIcons name="support-agent" size={16} color={appColors.primary} />
          <Text style={styles.assistLabel}>{loginScreenDefaults.controlRoomLabel}</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.assistChip, pressed && styles.assistChipPressed]}
          onPress={() => Linking.openURL(`tel:${loginScreenDefaults.supervisorTel}`)}
        >
          <MaterialIcons name="security" size={16} color={appColors.primary} />
          <Text style={styles.assistLabel}>{loginScreenDefaults.supervisorLabel}</Text>
        </Pressable>
      </View>

      <View style={styles.complianceRow}>
        <MaterialIcons name="verified" size={15} color={appColors.primary} />
        <Text style={styles.complianceText}>{loginScreenDefaults.complianceLabel}</Text>
      </View>
    </View>
  );
}
