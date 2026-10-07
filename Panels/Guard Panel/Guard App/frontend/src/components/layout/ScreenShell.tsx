import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { BottomTabKey } from '../../constants/bottom-tab-menu-items';
import { useGuardAppNavigation } from '../../navigation/useGuardAppNavigation';
import { appLayout, appSpacing } from '../../theme';
import { layoutScreenShellStyles as styles } from '../../styles/layout-screen-shell.styles';
import { BottomTabMenu } from './BottomTabMenu';
import { TopAppHeader } from './TopAppHeader';

type ScreenShellProps = {
  screenTitle?: string;
  activeTab?: BottomTabKey;
  profilePhotoUri?: string;
  children: ReactNode;
};

export function ScreenShell({
  screenTitle = 'Home',
  activeTab = 'home',
  profilePhotoUri,
  children,
}: ScreenShellProps) {
  const insets = useSafeAreaInsets();
  const { setMainTab } = useGuardAppNavigation();

  const contentTopPad = insets.top + appLayout.headerHeight;
  const contentBottomPad = insets.bottom + appLayout.bottomNavHeight + appSpacing.md;

  return (
    <View style={styles.root}>
      <TopAppHeader screenTitle={screenTitle} profilePhotoUri={profilePhotoUri} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: contentTopPad + appSpacing.md,
            paddingBottom: contentBottomPad,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>

      <BottomTabMenu activeTab={activeTab} onTabPress={setMainTab} />
    </View>
  );
}
