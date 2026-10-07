import { MaterialIcons } from '@expo/vector-icons';
import { Modal, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { guardProfileDefaults } from '../../constants/guard-profile-defaults';
import { guardProfileModalsStyles as styles } from '../../styles/guard-profile-modals.styles';
import { appColors, appSpacing } from '../../theme';
import { GuardProfileAuditQr } from './GuardProfileAuditQr';

type GuardProfileQrModalProps = {
  visible: boolean;
  onClose: () => void;
};

export function GuardProfileQrModal({ visible, onClose }: GuardProfileQrModalProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, appSpacing.lg) }]}>
          <View style={styles.sheetHeader}>
            <View style={styles.sheetTitleRow}>
              <MaterialIcons name="verified" size={26} color={appColors.primary} />
              <Text style={styles.sheetTitle}>{guardProfileDefaults.auditModalTitle}</Text>
            </View>
            <Pressable
              accessibilityLabel="Close Inspection Modal"
              style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
              onPress={onClose}
            >
              <MaterialIcons name="close" size={24} color={appColors.onSurface} />
            </Pressable>
          </View>

          <View style={styles.qrPanel}>
            <View style={styles.qrFrame}>
              <GuardProfileAuditQr size={224} />
            </View>
            <Text style={styles.auditName}>{guardProfileDefaults.guardName}</Text>
            <Text style={styles.auditId}>
              {`ID: ${guardProfileDefaults.guardId} • ${guardProfileDefaults.gradeLabel}`}
            </Text>
            <Text style={styles.auditAgency}>{guardProfileDefaults.auditAgencyLine}</Text>
            <View style={styles.verifiedPill}>
              <View style={styles.verifiedDot} />
              <Text style={styles.verifiedText}>{guardProfileDefaults.auditVerified}</Text>
            </View>
          </View>

          <View style={styles.brightnessRow}>
            <MaterialIcons name="brightness-high" size={18} color={appColors.secondary} />
            <Text style={styles.brightnessText}>{guardProfileDefaults.brightnessNote}</Text>
          </View>

          <Pressable
            style={({ pressed }) => [styles.doneButton, pressed && styles.pressed]}
            onPress={onClose}
          >
            <Text style={styles.doneLabel}>{guardProfileDefaults.doneInspecting}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
