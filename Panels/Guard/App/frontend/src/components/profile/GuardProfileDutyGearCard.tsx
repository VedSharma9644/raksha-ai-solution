import { MaterialIcons } from '@expo/vector-icons';
import { ActivityIndicator, Text, View } from 'react-native';

import { guardProfileDefaults } from '../../constants/guard-profile-defaults';
import { useGuardProfile } from '../../hooks/useGuardProfile';
import { guardProfileSectionCardStyles as styles } from '../../styles/guard-profile-section-card.styles';
import { appColors } from '../../theme';

function gearIcon(
  category: string,
): keyof typeof MaterialIcons.glyphMap {
  const key = category.toLowerCase();
  if (key.includes('radio') || key.includes('walkie') || key.includes('communication')) {
    return 'cell-tower';
  }
  if (key.includes('uniform') || key.includes('apparel') || key.includes('cloth')) {
    return 'checkroom';
  }
  if (key.includes('torch') || key.includes('light')) {
    return 'flashlight-on';
  }
  if (key.includes('shoe') || key.includes('boot')) {
    return 'hiking';
  }
  return 'inventory-2';
}

export function GuardProfileDutyGearCard() {
  const { profile, isLoading } = useGuardProfile();
  const gear = profile?.gear ?? [];

  if (!isLoading && gear.length === 0) {
    return null;
  }

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={styles.iconWrap}>
            <MaterialIcons name="security" size={20} color={appColors.primary} />
          </View>
          <Text style={styles.title}>{guardProfileDefaults.gearTitle}</Text>
        </View>
        {gear.length > 0 ? (
          <Text style={styles.headerMetaMuted}>
            {gear.length} item{gear.length === 1 ? '' : 's'}
          </Text>
        ) : null}
      </View>

      {isLoading && !profile ? (
        <ActivityIndicator color={appColors.primary} style={{ marginVertical: 12 }} />
      ) : null}

      <View style={styles.stackTight}>
        {gear.map((item) => (
          <View key={item.id} style={styles.listItem}>
            <View style={[styles.listLeft, styles.listLeftCenter]}>
              <MaterialIcons
                name={gearIcon(item.category)}
                size={24}
                color={appColors.primary}
              />
              <View style={styles.listCopy}>
                <Text style={styles.listTitle}>{item.itemName}</Text>
                <Text style={styles.listMeta}>
                  {item.category}
                  {item.quantity > 0
                    ? ` · ${item.quantity} ${item.unit || 'pcs'}`
                    : ''}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
