import { MaterialIcons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { guardProfileDefaults } from '../../constants/guard-profile-defaults';
import {
  formatPhoneDisplay,
  toTelHref,
  useGuardProfile,
} from '../../hooks/useGuardProfile';
import { getLanguageOption, translate, useLanguage } from '../../i18n';
import { guardProfileSupportCardStyles as styles } from '../../styles/guard-profile-support-card.styles';
import { appColors } from '../../theme';
import { LanguagePickerModal } from './LanguagePickerModal';

type GuardProfileSupportCardProps = {
  onLogoutPress: () => void;
  onLanguageChanged?: (message: string) => void;
};

export function GuardProfileSupportCard({
  onLogoutPress,
  onLanguageChanged,
}: GuardProfileSupportCardProps) {
  const { profile } = useGuardProfile();
  const { languageOption, languageLabel, t } = useLanguage();
  const [pickerVisible, setPickerVisible] = useState(false);

  const hrName = profile?.site.hrName?.trim() || 'Site HR';
  const hrContact =
    profile?.site.hrContact?.trim() || profile?.agencyPhone?.trim() || '';
  const hrTel = toTelHref(hrContact);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{t('profile.supportTitle')}</Text>

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
                {t('profile.callHr', { name: hrName })}
              </Text>
              <Text style={styles.helplineSub}>{formatPhoneDisplay(hrContact)}</Text>
            </View>
          </View>
          <MaterialIcons name="call" size={22} color={appColors.onPrimary} />
        </Pressable>
      ) : null}

      <Pressable
        style={({ pressed }) => [styles.rowTile, pressed && styles.pressed]}
        onPress={() => setPickerVisible(true)}
      >
        <View style={styles.rowLeft}>
          <MaterialIcons name="translate" size={22} color={appColors.secondary} />
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={styles.rowTitle}>{t('profile.languageTitle')}</Text>
            <Text style={styles.rowSub} numberOfLines={1}>
              {languageLabel}
            </Text>
          </View>
        </View>
        <View style={styles.langChip}>
          <Text style={styles.langChipLabel} numberOfLines={1}>
            {languageOption.nameNative}
          </Text>
          <MaterialIcons name="expand-more" size={18} color={appColors.onPrimary} />
        </View>
      </Pressable>

      <View style={styles.logoutWrap}>
        <Pressable
          style={({ pressed }) => [styles.logoutButton, pressed && styles.pressed]}
          onPress={onLogoutPress}
        >
          <MaterialIcons name="logout" size={22} color={appColors.error} />
          <Text style={styles.logoutLabel}>{t('profile.logout')}</Text>
        </Pressable>
        <Text style={styles.version}>{guardProfileDefaults.appVersion}</Text>
      </View>

      <LanguagePickerModal
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        onSelect={(code) => {
          const selected = getLanguageOption(code);
          onLanguageChanged?.(
            translate(code, 'profile.languageChanged', {
              language: selected.nameNative,
            }),
          );
        }}
      />
    </View>
  );
}
