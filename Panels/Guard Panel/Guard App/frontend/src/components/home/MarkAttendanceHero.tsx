import { MaterialIcons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { useGuardAppNavigation } from '../../navigation/useGuardAppNavigation';
import { appColors } from '../../theme';
import { homeMarkAttendanceHeroStyles as styles } from '../../styles/home-mark-attendance-hero.styles';
import { PrimaryActionButton } from '../shared/PrimaryActionButton';

export function MarkAttendanceHero() {
  const { openPatrolSession } = useGuardAppNavigation();

  return (
    <View style={styles.card}>
      <View style={[styles.blob, styles.blobTopRight]} />
      <View style={[styles.blob, styles.blobBottomLeft]} />

      <View style={styles.pill}>
        <MaterialIcons name="verified-user" size={18} color={appColors.onPrimary} />
        <Text style={styles.pillText}>GEO-FENCED SITE CAMERA</Text>
      </View>

      <View style={styles.cameraCircle}>
        <MaterialIcons name="photo-camera" size={42} color={appColors.primary} />
      </View>

      <Text style={styles.title}>MARK ATTENDANCE</Text>
      <Text style={styles.subtitle}>Take live selfie photo at your site to punch in</Text>

      <View style={styles.lockRow}>
        <MaterialIcons name="lock" size={18} color={appColors.onPrimaryContainer} />
        <Text style={styles.lockText}>Live GPS & Camera Verified • No Gallery Upload</Text>
      </View>

      <PrimaryActionButton
        label="Tap to Open Camera"
        icon="center-focus-strong"
        onPress={openPatrolSession}
        variant="light"
      />
    </View>
  );
}
