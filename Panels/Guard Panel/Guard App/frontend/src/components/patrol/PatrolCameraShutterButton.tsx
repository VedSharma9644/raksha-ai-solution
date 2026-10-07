import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { patrolSessionDefaults } from '../../constants/patrol-session-defaults';
import { appColors } from '../../theme';
import { patrolCameraShutterBarStyles as styles } from '../../styles/patrol-camera-shutter-bar.styles';

type PatrolCameraShutterButtonProps = {
  onCapturePress: () => void;
  hintText?: string;
};

export function PatrolCameraShutterButton({
  onCapturePress,
  hintText = patrolSessionDefaults.shutterHint,
}: PatrolCameraShutterButtonProps) {
  return (
    <View style={styles.bar}>
      <Pressable
        accessibilityLabel="Capture attendance punch photo"
        onPress={onCapturePress}
        style={({ pressed }) => [styles.shutterOuter, pressed && styles.shutterOuterPressed]}
      >
        <View style={styles.pulseRing} />
        <View style={styles.shutterInner}>
          <MaterialIcons name="photo-camera" size={32} color={appColors.primary} />
        </View>
      </Pressable>
      <Text style={styles.hint}>{hintText}</Text>
    </View>
  );
}
