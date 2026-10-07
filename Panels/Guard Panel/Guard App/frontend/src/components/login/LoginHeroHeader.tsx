import { MaterialIcons } from '@expo/vector-icons';
import { Image, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { loginScreenDefaults } from '../../constants/login-screen-defaults';
import { loginHeroHeaderStyles as styles } from '../../styles/login-hero-header.styles';
import { appColors } from '../../theme';

type LoginHeroHeaderProps = {
  isHindi: boolean;
  onToggleLang: () => void;
};

export function LoginHeroHeader({ isHindi, onToggleLang }: LoginHeroHeaderProps) {
  const insets = useSafeAreaInsets();

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
          onPress={onToggleLang}
        >
          <MaterialIcons name="translate" size={15} color={appColors.primaryFixed} />
          <Text style={styles.langLabel}>
            {isHindi ? loginScreenDefaults.langLabelHindi : loginScreenDefaults.langLabelEnglish}
          </Text>
        </Pressable>
      </View>

      <View style={styles.heroCenter}>
        <View style={styles.authorizedBadge}>
          <MaterialIcons name="verified-user" size={15} color={appColors.primaryFixed} />
          <Text style={styles.authorizedText}>{loginScreenDefaults.authorizedBadge}</Text>
        </View>
        <Text style={styles.welcomeTitle}>{loginScreenDefaults.welcomeTitle}</Text>
        <Text style={styles.welcomeSubtitle}>{loginScreenDefaults.welcomeSubtitle}</Text>
      </View>
    </View>
  );
}
