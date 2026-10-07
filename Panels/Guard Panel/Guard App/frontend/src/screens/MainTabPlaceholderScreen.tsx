import { Text, View } from 'react-native';

import { ScreenShell } from '../components/layout/ScreenShell';
import type { BottomTabKey } from '../constants/bottom-tab-menu-items';
import { appColors, appSpacing, appTypography } from '../theme';

type MainTabPlaceholderScreenProps = {
  screenTitle: string;
  activeTab: BottomTabKey;
  message: string;
};

export function MainTabPlaceholderScreen({
  screenTitle,
  activeTab,
  message,
}: MainTabPlaceholderScreenProps) {
  return (
    <ScreenShell screenTitle={screenTitle} activeTab={activeTab}>
      <View style={{ paddingVertical: appSpacing.xl }}>
        <Text
          style={{
            ...appTypography.bodyLg,
            color: appColors.onSurfaceVariant,
            textAlign: 'center',
          }}
        >
          {message}
        </Text>
      </View>
    </ScreenShell>
  );
}
