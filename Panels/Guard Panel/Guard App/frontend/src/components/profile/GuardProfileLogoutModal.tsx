import { MaterialIcons } from '@expo/vector-icons';
import { Modal, Pressable, Text, View } from 'react-native';

import { guardProfileDefaults } from '../../constants/guard-profile-defaults';
import { guardProfileModalsStyles as styles } from '../../styles/guard-profile-modals.styles';
import { appColors } from '../../theme';

type GuardProfileLogoutModalProps = {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function GuardProfileLogoutModal({
  visible,
  onCancel,
  onConfirm,
}: GuardProfileLogoutModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.logoutBackdrop}>
        <View style={styles.logoutCard}>
          <View style={styles.warningIcon}>
            <MaterialIcons name="warning" size={28} color={appColors.onErrorContainer} />
          </View>
          <View>
            <Text style={styles.logoutTitle}>{guardProfileDefaults.logoutModalTitle}</Text>
            <Text style={styles.logoutMessage}>{guardProfileDefaults.logoutModalMessage}</Text>
          </View>
          <View style={styles.logoutActions}>
            <Pressable
              style={({ pressed }) => [styles.cancelButton, pressed && styles.pressed]}
              onPress={onCancel}
            >
              <Text style={styles.cancelLabel}>{guardProfileDefaults.logoutCancel}</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.confirmButton, pressed && styles.pressed]}
              onPress={onConfirm}
            >
              <Text style={styles.confirmLabel}>{guardProfileDefaults.logoutConfirm}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
