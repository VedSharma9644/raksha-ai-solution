import { useState } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { loginScreenStyles as styles } from '../../styles/login-screen.styles';
import { LoginAuthCard } from './LoginAuthCard';
import { LoginHeroHeader } from './LoginHeroHeader';
import { LoginSupportFooter } from './LoginSupportFooter';

export function LoginScreenContent() {
  const insets = useSafeAreaInsets();
  const [isHindi, setIsHindi] = useState(false);

  return (
    <>
      <LoginHeroHeader isHindi={isHindi} onToggleLang={() => setIsHindi((value) => !value)} />
      <View style={[styles.main, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <LoginAuthCard isHindi={isHindi} />
        <LoginSupportFooter />
      </View>
    </>
  );
}
