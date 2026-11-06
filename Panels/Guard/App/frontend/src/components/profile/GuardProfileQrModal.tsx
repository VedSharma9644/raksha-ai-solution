import { MaterialIcons } from '@expo/vector-icons';
import { Modal, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { guardProfileDefaults } from '../../constants/guard-profile-defaults';
import { useGuardProfile } from '../../hooks/useGuardProfile';
import { useGuardAppNavigation } from '../../navigation/useGuardAppNavigation';
import { guardProfileModalsStyles as styles } from '../../styles/guard-profile-modals.styles';
import { appColors, appSpacing } from '../../theme';
import { GuardProfileAuditQr } from './GuardProfileAuditQr';

type GuardProfileQrModalProps = {
  visible: boolean;
  onClose: () => void;
};

export function GuardProfileQrModal({ visible, onClose }: GuardProfileQrModalProps) {
  const insets = useSafeAreaInsets();
  const { guardUser } = useGuardAppNavigation();
  const { profile } = useGuardProfile();
  const guardName =
    profile?.fullName?.trim() || guardUser?.fullName?.trim() || 'Guard';
  const guardId =
    profile?.employeeCode?.trim() || guardUser?.employeeCode?.trim() || '—';
  const siteLine =
    [profile?.agencyName?.trim(), profile?.site.siteName?.trim(), profile?.site.postName?.trim()]
      .filter(Boolean)
      .join(' • ') ||
    [guardUser?.siteName?.trim(), guardUser?.postName?.trim()]
      .filter(Boolean)
      .join(' • ') ||
    'Assigned Site';

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, appSpacing.lg) }]}>
          <View style={styles.sheetHeader}>
            <View style={styles.sheetTitleRow}>
              <MaterialIcons name="verified" size={26} color={appColors.primary} />
              <Text style={styles.sheetTitle}>Guard ID Badge</Text>
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
            <Text style={styles.auditName}>{guardName}</Text>
            <Text style={styles.auditId}>{`ID: ${guardId}`}</Text>
            <Text style={styles.auditAgency}>{siteLine}</Text>
            <View style={styles.verifiedPill}>
              <View style={styles.verifiedDot} />
              <Text style={styles.verifiedText}>On-duty identity card</Text>
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
