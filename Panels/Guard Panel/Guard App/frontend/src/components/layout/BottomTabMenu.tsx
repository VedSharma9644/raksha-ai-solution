import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  bottomTabMenuItems,
  type BottomTabKey,
} from '../../constants/bottom-tab-menu-items';
import { appColors } from '../../theme';
import { layoutBottomTabMenuStyles as styles } from '../../styles/layout-bottom-tab-menu.styles';

type BottomTabMenuProps = {
  activeTab?: BottomTabKey;
  onTabPress?: (tab: BottomTabKey) => void;
};

export function BottomTabMenu({ activeTab = 'home', onTabPress }: BottomTabMenuProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrapper, { paddingBottom: insets.bottom }]}>
      <View style={styles.row}>
        {bottomTabMenuItems.map((tab) => {
          const active = tab.key === activeTab;
          const color = active ? appColors.primaryContainer : appColors.secondary;

          return (
            <Pressable
              key={tab.key}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              onPress={() => onTabPress?.(tab.key)}
              style={styles.tab}
            >
              <MaterialIcons name={tab.icon} size={26} color={color} />
              <Text style={[styles.label, { color }, active && styles.labelActive]}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <View style={styles.homeIndicatorWrap}>
        <View style={styles.homeIndicator} />
      </View>
    </View>
  );
}
