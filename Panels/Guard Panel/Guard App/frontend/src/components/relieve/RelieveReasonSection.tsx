import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import {
  reliefReasonChips,
  relieveAGuardDefaults,
  type ReliefReasonKey,
} from '../../constants/relieve-a-guard-defaults';
import { relieveReasonSectionStyles as styles } from '../../styles/relieve-reason-section.styles';
import { appColors } from '../../theme';

type VoiceNoteState = 'idle' | 'recording' | 'attached';

type RelieveReasonSectionProps = {
  selectedReason: ReliefReasonKey;
  onSelectReason: (reason: ReliefReasonKey) => void;
  voiceState: VoiceNoteState;
  onToggleVoice: () => void;
};

function iconColor(tone: (typeof reliefReasonChips)[number]['iconTone'], selected: boolean) {
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
  voiceState,
  onToggleVoice,
}: RelieveReasonSectionProps) {
  const voiceTitle =
    voiceState === 'recording'
      ? relieveAGuardDefaults.voiceTitleRecording
      : voiceState === 'attached'
        ? relieveAGuardDefaults.voiceTitleAttached
        : relieveAGuardDefaults.voiceTitleIdle;

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

      <Pressable
        style={({ pressed }) => [styles.voiceButton, pressed && styles.voiceButtonPressed]}
        onPress={onToggleVoice}
      >
        <View style={styles.voiceLeft}>
          <View
            style={[styles.micCircle, voiceState === 'recording' && styles.micCircleRecording]}
          >
            <MaterialIcons
              name="mic"
              size={20}
              color={voiceState === 'recording' ? appColors.onTertiary : appColors.onPrimary}
            />
          </View>
          <View style={styles.voiceCopy}>
            <Text style={styles.voiceTitle}>{voiceTitle}</Text>
            <Text style={styles.voiceSubtitle}>{relieveAGuardDefaults.voiceSubtitle}</Text>
          </View>
        </View>
        <MaterialIcons name="chevron-right" size={24} color={appColors.onSurfaceVariant} />
      </Pressable>
    </View>
  );
}
