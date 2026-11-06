import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { appColors } from '../../theme';
import { patrolCameraTopControlsStyles as styles } from '../../styles/patrol-camera-top-controls.styles';
import { PatrolActiveSitePill } from './PatrolActiveSitePill';

type PatrolCameraTopControlsProps = {
  onCancelPress: () => void;
  flashEnabled: boolean;
  onToggleFlash: () => void;
  onFlipCamera: () => void;
};

export function PatrolCameraTopControls({
  onCancelPress,
  flashEnabled,
  onToggleFlash,
  onFlipCamera,
}: PatrolCameraTopControlsProps) {
  return (
    <View style={styles.section}>
      <View style={styles.row}>
        <Pressable
          onPress={onCancelPress}
          style={({ pressed }) => [styles.cancelButton, pressed && styles.cancelButtonPressed]}
        >
          <MaterialIcons name="arrow-back" size={20} color={appColors.inverseOnSurface} />
          <Text style={styles.cancelLabel}>Cancel</Text>
        </Pressable>

        <View style={styles.iconGroup}>
          <Pressable
            accessibilityLabel="Toggle flash"
            onPress={onToggleFlash}
            style={({ pressed }) => [
              styles.roundIconButton,
              pressed && styles.roundIconButtonPressed,
            ]}
          >
            <MaterialIcons
              name={flashEnabled ? 'flash-on' : 'flash-off'}
              size={22}
              color={appColors.inverseOnSurface}
            />
          </Pressable>

          <Pressable
            accessibilityLabel="Flip camera"
            onPress={onFlipCamera}
            style={({ pressed }) => [
              styles.roundIconButton,
              pressed && styles.roundIconButtonPressed,
            ]}
          >
            <MaterialIcons name="flip-camera-ios" size={22} color={appColors.inverseOnSurface} />
          </Pressable>
        </View>
      </View>

      <PatrolActiveSitePill />
    </View>
  );
}
