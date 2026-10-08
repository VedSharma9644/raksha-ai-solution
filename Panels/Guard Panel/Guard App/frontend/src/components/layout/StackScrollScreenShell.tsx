import type { ReactNode } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { BottomTabKey } from '../../constants/bottom-tab-menu-items';
import { useGuardAppNavigation } from '../../navigation/useGuardAppNavigation';
import { appColors, appLayout, appSpacing } from '../../theme';
import { layoutStackScrollScreenStyles as styles } from '../../styles/layout-stack-scroll-screen.styles';
import { BackNavigationHeader } from './BackNavigationHeader';
import { BottomTabMenu } from './BottomTabMenu';

type StackScrollScreenShellProps = {
  screenTitle: string;
  onBackPress: () => void;
  brandEyebrow?: string;
  profilePhotoUri?: string;
  showNotifications?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  activeTab?: BottomTabKey;
  children: ReactNode;
};

export function StackScrollScreenShell({
  screenTitle,
  onBackPress,
  brandEyebrow,
  profilePhotoUri,
  showNotifications,
  refreshing,
  onRefresh,
  activeTab,
  children,
}: StackScrollScreenShellProps) {
  const insets = useSafeAreaInsets();
  const { setMainTab, mainTab } = useGuardAppNavigation();
  const resolvedTab = activeTab ?? mainTab;

  const contentBottomPad =
    appLayout.bottomNavHeight + Math.max(insets.bottom, 6) + appSpacing.md;

  return (
    <View style={styles.root}>
      <BackNavigationHeader
        screenTitle={screenTitle}
        onBackPress={onBackPress}
        brandEyebrow={brandEyebrow}
        profilePhotoUri={profilePhotoUri}
        showNotifications={showNotifications}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: contentBottomPad },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={Boolean(refreshing)}
              onRefresh={onRefresh}
              tintColor={appColors.primary}
              colors={[appColors.primary]}
            />
          ) : undefined
        }
      >
        {children}
      </ScrollView>

      <BottomTabMenu activeTab={resolvedTab} onTabPress={setMainTab} />
    </View>
  );
}
