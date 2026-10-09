import { MaterialIcons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { Pressable, Text, View } from 'react-native';

import {
  guardProfileDefaults,
  type ProfileLanguage,
} from '../../constants/guard-profile-defaults';
import {
  formatPhoneDisplay,
  toTelHref,
  useGuardProfile,
} from '../../hooks/useGuardProfile';
import { guardProfileSupportCardStyles as styles } from '../../styles/guard-profile-support-card.styles';
import { appColors } from '../../theme';

type GuardProfileSupportCardProps = {
  language: ProfileLanguage;
  onLanguageChange: (language: ProfileLanguage) => void;
  onOpenSecurity: () => void;
  onLogoutPress: () => void;
};

export function GuardProfileSupportCard({
  language,
  onLanguageChange,
  onOpenSecurity,
  onLogoutPress,
}: GuardProfileSupportCardProps) {
  const { profile } = useGuardProfile();
  const hrName = profile?.site.hrName?.trim() || 'Site HR';
  const hrContact =
    profile?.site.hrContact?.trim() || profile?.agencyPhone?.trim() || '';
  const hrTel = toTelHref(hrContact);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{guardProfileDefaults.supportTitle}</Text>

      <Pressable
        style={({ pressed }) => [styles.helpline, pressed && styles.pressed]}
        onPress={() => {
          if (hrTel) {
            void Linking.openURL(`tel:${hrTel}`);
          }
        }}
        disabled={!hrTel}
      >
        <View style={styles.helplineLeft}>
          <View style={styles.helplineIcon}>
            <MaterialIcons name="support-agent" size={22} color={appColors.onPrimary} />
          </View>
          <View>
            <Text style={styles.helplineTitle}>Call {hrName}</Text>
            <Text style={styles.helplineSub}>
              {hrContact
                ? formatPhoneDisplay(hrContact)
                : 'HR phone not on file for this site'}
            </Text>
          </View>
        </View>
        <MaterialIcons name="arrow-forward" size={24} color={appColors.onPrimary} />
      </Pressable>

      <View style={styles.rowTile}>
        <View style={styles.rowLeft}>
          <MaterialIcons name="translate" size={22} color={appColors.secondary} />
          <View>
            <Text style={styles.rowTitle}>{guardProfileDefaults.languageTitle}</Text>
            <Text style={styles.rowSub}>
              {language === 'EN'
                ? guardProfileDefaults.languageSub
                : guardProfileDefaults.languageSubHi}
            </Text>
          </View>
        </View>
        <View style={styles.langToggle}>
          <Pressable
            style={[styles.langButton, language === 'EN' && styles.langButtonActive]}
            onPress={() => onLanguageChange('EN')}
          >
            <Text style={[styles.langLabel, language === 'EN' && styles.langLabelActive]}>EN</Text>
          </Pressable>
          <Pressable
            style={[styles.langButton, language === 'HI' && styles.langButtonActive]}
            onPress={() => onLanguageChange('HI')}
          >
            <Text style={[styles.langLabel, language === 'HI' && styles.langLabelActive]}>
              हिन्दी
            </Text>
          </Pressable>
        </View>
      </View>

      <Pressable
        style={({ pressed }) => [styles.rowTile, pressed && styles.pressed]}
        onPress={onOpenSecurity}
      >
        <View style={styles.rowLeft}>
          <MaterialIcons name="lock-reset" size={22} color={appColors.secondary} />
          <View>
            <Text style={styles.rowTitle}>{guardProfileDefaults.securityTitle}</Text>
            <Text style={styles.rowSub}>{guardProfileDefaults.securitySub}</Text>
          </View>
        </View>
        <MaterialIcons name="chevron-right" size={20} color={appColors.secondary} />
      </Pressable>

      <View style={styles.logoutWrap}>
        <Pressable
          style={({ pressed }) => [styles.logoutButton, pressed && styles.pressed]}
          onPress={onLogoutPress}
        >
          <MaterialIcons name="logout" size={22} color={appColors.error} />
          <Text style={styles.logoutLabel}>{guardProfileDefaults.logoutLabel}</Text>
        </Pressable>
        <Text style={styles.version}>{guardProfileDefaults.appVersion}</Text>
      </View>
    </View>
  );
}
