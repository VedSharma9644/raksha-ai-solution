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
  onLogoutPress: () => void;
};

export function GuardProfileSupportCard({
  language,
  onLanguageChange,
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

      {hrTel ? (
        <Pressable
          style={({ pressed }) => [styles.helpline, pressed && styles.pressed]}
          onPress={() => {
            void Linking.openURL(`tel:${hrTel}`);
          }}
        >
          <View style={styles.helplineLeft}>
            <View style={styles.helplineIcon}>
              <MaterialIcons name="support-agent" size={22} color={appColors.onPrimary} />
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.helplineTitle} numberOfLines={1}>
                Call {hrName}
              </Text>
              <Text style={styles.helplineSub}>{formatPhoneDisplay(hrContact)}</Text>
            </View>
          </View>
          <MaterialIcons name="call" size={22} color={appColors.onPrimary} />
        </Pressable>
      ) : null}

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
