import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { appSpacing } from '../../theme';
import { layoutStackScrollScreenStyles as styles } from '../../styles/layout-stack-scroll-screen.styles';
import { BackNavigationHeader } from './BackNavigationHeader';

type StackScrollScreenShellProps = {
  screenTitle: string;
  onBackPress: () => void;
  brandEyebrow?: string;
  profilePhotoUri?: string;
  showNotifications?: boolean;
  children: ReactNode;
};

export function StackScrollScreenShell({
  screenTitle,
  onBackPress,
  brandEyebrow,
  profilePhotoUri,
  showNotifications,
  children,
}: StackScrollScreenShellProps) {
  const insets = useSafeAreaInsets();

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
          { paddingBottom: insets.bottom + appSpacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </View>
  );
}
