import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { appColors } from '../../theme';
import { sharedIconActionTileStyles as styles } from '../../styles/shared-icon-action-tile.styles';

type IconActionTileProps = {
  title: string;
  subtitle: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  onPress?: () => void;
};

export function IconActionTile({ title, subtitle, icon, onPress }: IconActionTileProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.tile, pressed && styles.tilePressed]}
      onPress={onPress}
    >
      <View style={styles.iconWrap}>
        <MaterialIcons name={icon} size={28} color={appColors.primary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </Pressable>
  );
}
