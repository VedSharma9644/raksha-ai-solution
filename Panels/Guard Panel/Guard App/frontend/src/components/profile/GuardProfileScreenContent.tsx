import { MaterialIcons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';

import {
  guardProfileDefaults,
  type ProfileLanguage,
} from '../../constants/guard-profile-defaults';
import { useGuardAppNavigation } from '../../navigation/useGuardAppNavigation';
import { guardProfileModalsStyles as modalStyles } from '../../styles/guard-profile-modals.styles';
import { guardProfileScreenStyles as styles } from '../../styles/guard-profile-screen.styles';
import { appColors } from '../../theme';
import { GuardProfileComplianceCard } from './GuardProfileComplianceCard';
import { GuardProfileDigitalIdCard } from './GuardProfileDigitalIdCard';
import { GuardProfileDutyGearCard } from './GuardProfileDutyGearCard';
import { GuardProfileEmergencyCard } from './GuardProfileEmergencyCard';
import { GuardProfileEmployerCard } from './GuardProfileEmployerCard';
import { GuardProfileLogoutModal } from './GuardProfileLogoutModal';
import { GuardProfileQrModal } from './GuardProfileQrModal';
import { GuardProfileSupportCard } from './GuardProfileSupportCard';

export function GuardProfileScreenContent() {
  const { signOut } = useGuardAppNavigation();
  const [language, setLanguage] = useState<ProfileLanguage>('EN');
  const [qrVisible, setQrVisible] = useState(false);
  const [logoutVisible, setLogoutVisible] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const logoutTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
      if (logoutTimeoutRef.current) {
        clearTimeout(logoutTimeoutRef.current);
      }
    };
  }, []);

  const showToast = (message: string) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToast(message);
    toastTimeoutRef.current = setTimeout(() => setToast(null), 3200);
  };

  const confirmLogout = () => {
    setLogoutVisible(false);
    showToast(guardProfileDefaults.toastLogout);
    logoutTimeoutRef.current = setTimeout(() => {
      signOut();
    }, 700);
  };

  return (
    <View style={styles.content}>
      <GuardProfileDigitalIdCard
        onOpenQr={() => setQrVisible(true)}
        onDownload={() =>
          showToast('PDF export will be available soon.')
        }
      />
      <GuardProfileEmployerCard />
      <GuardProfileComplianceCard />
      <GuardProfileDutyGearCard />
      <GuardProfileEmergencyCard />
      <GuardProfileSupportCard
        language={language}
        onLanguageChange={setLanguage}
        onOpenSecurity={() => showToast(guardProfileDefaults.toastSecurity)}
        onLogoutPress={() => setLogoutVisible(true)}
      />

      {toast ? (
        <View style={modalStyles.toast}>
          <MaterialIcons name="task-alt" size={24} color={appColors.primaryFixedDim} />
          <Text style={modalStyles.toastText}>{toast}</Text>
        </View>
      ) : null}

      <GuardProfileQrModal visible={qrVisible} onClose={() => setQrVisible(false)} />
      <GuardProfileLogoutModal
        visible={logoutVisible}
        onCancel={() => setLogoutVisible(false)}
        onConfirm={confirmLogout}
      />
    </View>
  );
}
