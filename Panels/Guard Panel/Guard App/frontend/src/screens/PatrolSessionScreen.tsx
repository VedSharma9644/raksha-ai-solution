import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackNavigationHeader } from '../components/layout/BackNavigationHeader';
import { PatrolSessionContent } from '../components/patrol/PatrolSessionContent';
import { patrolSessionDefaults } from '../constants/patrol-session-defaults';
import { useGuardAppNavigation } from '../navigation/useGuardAppNavigation';
import { patrolSessionScreenStyles as styles } from '../styles/patrol-session-screen.styles';
import { appSpacing } from '../theme';

export function PatrolSessionScreen() {
  const { goBack } = useGuardAppNavigation();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <BackNavigationHeader
        screenTitle={patrolSessionDefaults.screenTitle}
        onBackPress={goBack}
      />

      <View
        style={[
          styles.content,
          { paddingBottom: Math.max(insets.bottom, appSpacing.md) },
        ]}
      >
        <PatrolSessionContent />
      </View>
    </View>
  );
}
