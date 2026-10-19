import { useState } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LanguagePickerModal } from '../profile/LanguagePickerModal';
import { loginScreenStyles as styles } from '../../styles/login-screen.styles';
import { LoginAuthCard } from './LoginAuthCard';
import { LoginHeroHeader } from './LoginHeroHeader';
import { LoginSupportFooter } from './LoginSupportFooter';

export function LoginScreenContent() {
  const insets = useSafeAreaInsets();
  const [pickerVisible, setPickerVisible] = useState(false);

  return (
    <>
      <LoginHeroHeader onOpenLanguagePicker={() => setPickerVisible(true)} />
      <View style={[styles.main, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <LoginAuthCard />
        <LoginSupportFooter />
      </View>
      <LanguagePickerModal
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
      />
    </>
  );
}
