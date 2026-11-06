import { MaterialIcons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { Text, View } from 'react-native';

import { showAlert } from '../../alerts/appAlert';

import {
  formatPhoneDisplay,
  toTelHref,
  useGuardProfile,
} from '../../hooks/useGuardProfile';
import { useLanguage } from '../../i18n';
import { appColors } from '../../theme';
import { homeEmergencySosPanelStyles as styles } from '../../styles/home-emergency-sos-panel.styles';
import { PrimaryActionButton } from '../shared/PrimaryActionButton';

export function EmergencySosPanel() {
  const { profile } = useGuardProfile();
  const { t } = useLanguage();
  const hrName = profile?.site.hrName?.trim() || 'Site HR';
  const hrContact = profile?.site.hrContact?.trim() || '';
  const hrTel = toTelHref(hrContact);

  const triggerSos = () => {
    showAlert(
      'ARE YOU IN AN EMERGENCY?',
      hrTel
        ? `Call ${hrName} (${formatPhoneDisplay(hrContact)}) for immediate assistance.`
        : 'Site HR phone is not on file. Contact your agency desk immediately.',
      [
        { text: t('common.cancel'), style: 'cancel' },
        ...(hrTel
          ? [
              {
                text: t('profile.callHr', { name: hrName }),
                style: 'destructive' as const,
                onPress: () => {
                  void Linking.openURL(`tel:${hrTel}`);
                },
              },
            ]
          : []),
      ],
    );
  };

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.warningIcon}>
          <MaterialIcons name="warning" size={28} color={appColors.onTertiary} />
        </View>
        <View style={styles.copy}>
          <Text style={styles.title} numberOfLines={2}>
            {t('home.sosTitle')}
          </Text>
          <Text style={styles.description}>{t('home.sosDescription')}</Text>
        </View>
      </View>

      <PrimaryActionButton
        label={t('home.sosButton')}
        icon="emergency"
        onPress={triggerSos}
        variant="emergency"
      />
    </View>
  );
}
