import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, Text, TextInput, View } from 'react-native';

import {
  reliefReasonChips,
  relieveAGuardDefaults,
  type ReliefReasonKey,
} from '../../constants/relieve-a-guard-defaults';
import { relieveReasonSectionStyles as styles } from '../../styles/relieve-reason-section.styles';
import { appColors } from '../../theme';

type RelieveReasonSectionProps = {
  selectedReason: ReliefReasonKey;
  onSelectReason: (reason: ReliefReasonKey) => void;
  note: string;
  onChangeNote: (note: string) => void;
};

function iconColor(
  tone: (typeof reliefReasonChips)[number]['iconTone'],
  selected: boolean,
) {
  if (selected) {
    return appColors.onPrimary;
  }
  switch (tone) {
    case 'tertiary':
      return appColors.tertiary;
    case 'secondary':
      return appColors.secondary;
    case 'error':
      return appColors.error;
    default:
      return appColors.primary;
  }
}

export function RelieveReasonSection({
  selectedReason,
  onSelectReason,
  note,
  onChangeNote,
}: RelieveReasonSectionProps) {
  return (
    <View style={styles.section}>
      <View style={styles.headerRow}>
        <View style={styles.stepBadge}>
          <Text style={styles.stepBadgeText}>4</Text>
        </View>
        <Text style={styles.stepTitle}>{relieveAGuardDefaults.step4Title}</Text>
      </View>

      <Text style={styles.hint}>{relieveAGuardDefaults.reasonHint}</Text>

      <View style={styles.chipsGrid}>
        {reliefReasonChips.map((chip) => {
          const selected = chip.key === selectedReason;
          return (
            <Pressable
              key={chip.key}
              onPress={() => onSelectReason(chip.key)}
              style={({ pressed }) => [
                styles.chip,
                selected && styles.chipSelected,
                pressed && styles.chipPressed,
              ]}
            >
              <MaterialIcons
                name={chip.icon}
                size={20}
                color={iconColor(chip.iconTone, selected)}
              />
              <Text style={[styles.chipLabel, selected && styles.chipLabelSelected]}>
                {chip.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.voiceButton}>
        <View style={styles.voiceLeft}>
          <View style={styles.micCircle}>
            <MaterialIcons name="notes" size={20} color={appColors.onPrimary} />
          </View>
          <View style={styles.voiceCopy}>
            <Text style={styles.voiceTitle}>Optional note</Text>
            <Text style={styles.voiceSubtitle}>
              Add context for Admin/HR (voice notes are not supported yet)
            </Text>
          </View>
        </View>
      </View>
      <TextInput
        value={note}
        onChangeText={onChangeNote}
        placeholder="Short note for the relief request…"
        placeholderTextColor={appColors.onSurfaceVariant}
        multiline
        style={{
          marginTop: 8,
          minHeight: 72,
          borderRadius: 12,
          padding: 12,
          backgroundColor: appColors.surfaceContainerHigh,
          color: appColors.onSurface,
          textAlignVertical: 'top',
        }}
      />
    </View>
  );
}
