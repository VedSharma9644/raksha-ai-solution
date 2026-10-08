import {
  PublicSans_400Regular,
  PublicSans_500Medium,
  PublicSans_600SemiBold,
  PublicSans_700Bold,
  PublicSans_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/public-sans';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { GuardAppNavigationProvider } from './src/navigation/GuardAppNavigationProvider';
import { GuardAppRoot } from './src/navigation/GuardAppRoot';
import { GuardNotificationsProvider } from './src/notifications/GuardNotificationsProvider';
import { appColors } from './src/theme';
import { appStartupLoadingStyles as loadingStyles } from './src/styles/app-startup-loading.styles';

export default function App() {
  const [fontsLoaded] = useFonts({
    PublicSans_400Regular,
    PublicSans_500Medium,
    PublicSans_600SemiBold,
    PublicSans_700Bold,
    PublicSans_800ExtraBold,
  });

  if (!fontsLoaded) {
    return (
      <View style={loadingStyles.container}>
        <ActivityIndicator size="large" color={appColors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <GuardAppNavigationProvider>
        <GuardNotificationsProvider>
          <GuardAppRoot />
        </GuardNotificationsProvider>
      </GuardAppNavigationProvider>
    </SafeAreaProvider>
  );
}
