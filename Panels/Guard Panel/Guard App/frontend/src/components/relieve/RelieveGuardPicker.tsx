import { MaterialIcons } from '@expo/vector-icons';
import { Alert, Pressable, Text, View } from 'react-native';

import {
  reliefGuardOptions,
  relieveAGuardDefaults,
} from '../../constants/relieve-a-guard-defaults';
import { relieveGuardPickerStyles as styles } from '../../styles/relieve-guard-picker.styles';
import { appColors } from '../../theme';

type RelieveGuardPickerProps = {
  selectedGuardId: string;
  onSelect: (guardId: string) => void;
};

export function RelieveGuardPicker({ selectedGuardId, onSelect }: RelieveGuardPickerProps) {
  return (
    <View style={styles.section}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={styles.stepBadge}>
            <Text style={styles.stepBadgeText}>3</Text>
          </View>
          <Text style={styles.stepTitle}>{relieveAGuardDefaults.step3Title}</Text>
        </View>
        <Text style={styles.clusterLabel}>{relieveAGuardDefaults.clusterLabel}</Text>
      </View>

      <Text style={styles.hint}>{relieveAGuardDefaults.guardListHint}</Text>

      <View style={styles.list}>
        {reliefGuardOptions.map((guard) => {
          const selected = guard.id === selectedGuardId;
          return (
            <Pressable
              key={guard.id}
              onPress={() => onSelect(guard.id)}
              style={[styles.guardCard, selected && styles.guardCardSelected]}
            >
              <View style={styles.avatarWrap}>
                <View style={[styles.avatar, selected ? styles.avatarSelected : styles.avatarIdle]}>
                  <Text
                    style={[
                      styles.avatarText,
                      selected ? styles.avatarTextSelected : styles.avatarTextIdle,
                    ]}
                  >
                    {guard.initials}
                  </Text>
                </View>
                {selected ? (
                  <View style={styles.checkDot}>
                    <MaterialIcons name="check" size={12} color={appColors.onPrimary} />
                  </View>
                ) : null}
              </View>

              <View style={styles.guardCopy}>
                <View style={styles.nameRow}>
                  <Text style={styles.guardName} numberOfLines={1}>
                    {guard.name}
                  </Text>
                  <MaterialIcons
                    name={selected ? 'check-circle' : 'radio-button-unchecked'}
                    size={26}
                    color={selected ? appColors.primary : appColors.outline}
                  />
                </View>
                <Text style={styles.guardMeta}>{guard.meta}</Text>
                <View style={styles.badgesRow}>
                  <View
                    style={[
                      styles.badge,
                      guard.primaryBadgeTone === 'available'
                        ? styles.badgeAvailable
                        : styles.badgeNeutral,
                    ]}
                  >
                    {guard.primaryBadgeTone === 'available' ? (
                      <View style={styles.badgeDot} />
                    ) : null}
                    <Text
                      style={
                        guard.primaryBadgeTone === 'available'
                          ? styles.badgeTextAvailable
                          : styles.badgeTextNeutral
                      }
                    >
                      {guard.primaryBadge}
                    </Text>
                  </View>
                  <View style={[styles.badge, styles.badgeSecondary]}>
                    <Text style={styles.badgeTextSecondary}>{guard.secondaryBadge}</Text>
                  </View>
                </View>
              </View>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        style={({ pressed }) => [styles.broadcastButton, pressed && styles.broadcastPressed]}
        onPress={() =>
          Alert.alert(
            'Broadcast request',
            'Supervisor will broadcast this relief request to all qualified guards.',
          )
        }
      >
        <MaterialIcons name="groups" size={22} color={appColors.primary} />
        <Text style={styles.broadcastLabel}>{relieveAGuardDefaults.broadcastLabel}</Text>
      </Pressable>
    </View>
  );
}
