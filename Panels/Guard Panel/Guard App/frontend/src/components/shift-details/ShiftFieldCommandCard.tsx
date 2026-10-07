import { MaterialIcons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { Image, Pressable, Text, View } from 'react-native';

import { brandAssets } from '../../constants/brand-assets';
import { shiftDetailsDefaults } from '../../constants/shift-details-defaults';
import { appColors } from '../../theme';
import { shiftFieldCommandCardStyles as styles } from '../../styles/shift-field-command-card.styles';

export function ShiftFieldCommandCard() {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <MaterialIcons name="security" size={24} color={appColors.primary} />
          <Text style={styles.headerTitle}>{shiftDetailsDefaults.fieldCommandTitle}</Text>
        </View>
        <Text style={styles.status}>{shiftDetailsDefaults.fieldCommandStatus}</Text>
      </View>

      <View style={styles.profileRow}>
        <Image source={{ uri: brandAssets.dutySupervisorPhotoUri }} style={styles.photo} />
        <View>
          <Text style={styles.name}>{shiftDetailsDefaults.supervisorName}</Text>
          <Text style={styles.role}>{shiftDetailsDefaults.supervisorRole}</Text>
          <Text style={styles.phone}>{shiftDetailsDefaults.supervisorPhoneDisplay}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable
          style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]}
          onPress={() => Linking.openURL(`tel:${shiftDetailsDefaults.supervisorPhoneTel}`)}
        >
          <MaterialIcons name="call" size={24} color={appColors.onPrimary} />
          <Text style={styles.primaryButtonText}>{shiftDetailsDefaults.callSupervisorLabel}</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.secondaryButton, pressed && styles.secondaryButtonPressed]}
          onPress={() => Linking.openURL(`tel:${shiftDetailsDefaults.centralDeskTel}`)}
        >
          <MaterialIcons name="support-agent" size={24} color={appColors.tertiary} />
          <Text style={styles.secondaryButtonText}>{shiftDetailsDefaults.centralDeskLabel}</Text>
        </Pressable>
      </View>
    </View>
  );
}
