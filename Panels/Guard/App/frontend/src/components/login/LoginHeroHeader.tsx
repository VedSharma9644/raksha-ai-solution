import { MaterialIcons } from '@expo/vector-icons';
import { Image, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { loginScreenDefaults } from '../../constants/login-screen-defaults';
import { useLanguage } from '../../i18n';
import { loginHeroHeaderStyles as styles } from '../../styles/login-hero-header.styles';
import { appColors } from '../../theme';

type LoginHeroHeaderProps = {
  onOpenLanguagePicker: () => void;
};

export function LoginHeroHeader({ onOpenLanguagePicker }: LoginHeroHeaderProps) {
  const insets = useSafeAreaInsets();
  const { languageOption, t } = useLanguage();

  return (
    <View style={[styles.header, { paddingTop: Math.max(insets.top, 12) }]}>
      <View style={styles.glow} />

      <View style={styles.topRow}>
        <View style={styles.brandRow}>
          <View style={styles.logoWrap}>
            <Image
              source={{ uri: loginScreenDefaults.crestLogoUri }}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <View>
            <Text style={styles.brandName}>{loginScreenDefaults.brandName}</Text>
            <Text style={styles.brandSubtitle}>{loginScreenDefaults.brandSubtitle}</Text>
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [styles.langButton, pressed && styles.langButtonPressed]}
          onPress={onOpenLanguagePicker}
        >
          <MaterialIcons name="translate" size={15} color={appColors.primaryFixed} />
          <Text style={styles.langLabel} numberOfLines={1}>
            {languageOption.nameNative}
          </Text>
        </Pressable>
      </View>

      <View style={styles.heroCenter}>
        <View style={styles.authorizedBadge}>
          <MaterialIcons name="verified-user" size={15} color={appColors.primaryFixed} />
          <Text style={styles.authorizedText}>{t('login.authorizedBadge')}</Text>
        </View>
        <Text style={styles.welcomeTitle}>{t('login.welcomeTitle')}</Text>
        <Text style={styles.welcomeSubtitle}>{t('login.welcomeSubtitle')}</Text>
      </View>
    </View>
  );
}
