import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  bottomTabMenuItems,
  type BottomTabKey,
} from '../../constants/bottom-tab-menu-items';
import { appColors, isCompact } from '../../theme';
import { layoutBottomTabMenuStyles as styles } from '../../styles/layout-bottom-tab-menu.styles';

type BottomTabMenuProps = {
  activeTab?: BottomTabKey;
  onTabPress?: (tab: BottomTabKey) => void;
};

export function BottomTabMenu({ activeTab = 'home', onTabPress }: BottomTabMenuProps) {
  const insets = useSafeAreaInsets();
  const iconSize = isCompact ? 22 : 24;

  return (
    <View style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, 6) }]}>
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
              style={({ pressed }) => [styles.tab, pressed && { opacity: 0.85 }]}
            >
              <MaterialIcons name={tab.icon} size={iconSize} color={color} />
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.8}
                style={[styles.label, { color }, active && styles.labelActive]}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
