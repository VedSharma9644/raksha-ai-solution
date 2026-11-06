import { StatusBar } from 'expo-status-bar';
import { ScrollView, View } from 'react-native';

import { LoginScreenContent } from '../components/login/LoginScreenContent';
import { loginScreenStyles as styles } from '../styles/login-screen.styles';

export function LoginScreen() {
  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <LoginScreenContent />
      </ScrollView>
    </View>
  );
}
