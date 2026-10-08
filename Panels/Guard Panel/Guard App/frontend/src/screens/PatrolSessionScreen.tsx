import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackNavigationHeader } from '../components/layout/BackNavigationHeader';
import { BottomTabMenu } from '../components/layout/BottomTabMenu';
import { PatrolSessionContent } from '../components/patrol/PatrolSessionContent';
import { patrolSessionDefaults } from '../constants/patrol-session-defaults';
import { useGuardAppNavigation } from '../navigation/useGuardAppNavigation';
import { patrolSessionScreenStyles as styles } from '../styles/patrol-session-screen.styles';
import { appLayout, appSpacing } from '../theme';

export function PatrolSessionScreen() {
  const { goBack, setMainTab, mainTab } = useGuardAppNavigation();
  const insets = useSafeAreaInsets();

  const contentBottomPad =
    appLayout.bottomNavHeight + Math.max(insets.bottom, 6) + appSpacing.md;

  return (
    <View style={styles.root}>
      <BackNavigationHeader
        screenTitle={patrolSessionDefaults.screenTitle}
        onBackPress={goBack}
      />

      <View style={[styles.content, { paddingBottom: contentBottomPad }]}>
        <PatrolSessionContent />
      </View>

      <BottomTabMenu activeTab={mainTab} onTabPress={setMainTab} />
    </View>
  );
}
