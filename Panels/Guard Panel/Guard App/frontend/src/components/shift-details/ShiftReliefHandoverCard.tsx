import { MaterialIcons } from '@expo/vector-icons';
import { Image, Pressable, Text, View } from 'react-native';

import { brandAssets } from '../../constants/brand-assets';
import { shiftDetailsDefaults } from '../../constants/shift-details-defaults';
import { useGuardAppNavigation } from '../../navigation/useGuardAppNavigation';
import { appColors } from '../../theme';
import { shiftReliefHandoverCardStyles as styles } from '../../styles/shift-relief-handover-card.styles';

export function ShiftReliefHandoverCard() {
  const { openRelieveAGuard } = useGuardAppNavigation();

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <MaterialIcons name="published-with-changes" size={24} color={appColors.primary} />
          <Text style={styles.headerTitle}>{shiftDetailsDefaults.reliefTitle}</Text>
        </View>
        <Text style={styles.squadLabel}>{shiftDetailsDefaults.reliefSquadLabel}</Text>
      </View>

      <View style={styles.profileRow}>
        <Image source={{ uri: brandAssets.reliefGuardPhotoUri }} style={styles.photo} />
        <View style={styles.copy}>
          <Text style={styles.name} numberOfLines={1}>
            {shiftDetailsDefaults.reliefGuardName}
          </Text>
          <Text style={styles.guardId}>{shiftDetailsDefaults.reliefGuardId}</Text>
          <View style={styles.reliefWindow}>
            <MaterialIcons name="access-time" size={18} color={appColors.primary} />
            <Text style={styles.reliefWindowText}>{shiftDetailsDefaults.reliefWindow}</Text>
          </View>
        </View>
      </View>

      <Pressable
        style={({ pressed }) => [styles.requestButton, pressed && styles.requestButtonPressed]}
        onPress={openRelieveAGuard}
      >
        <MaterialIcons name="swap-horiz" size={22} color={appColors.onSecondaryContainer} />
        <Text style={styles.requestButtonText}>{shiftDetailsDefaults.reliefRequestLabel}</Text>
      </Pressable>
    </View>
  );
}
