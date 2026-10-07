import { MaterialIcons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import {
  applyForLeaveDefaults,
  leaveReasonOptions,
} from '../../constants/apply-for-leave-defaults';
import { appColors } from '../../theme';
import { leaveReasonAndNoteStyles as styles } from '../../styles/leave-reason-and-note.styles';

type LeaveReasonAndNoteSectionProps = {
  selectedReason: string;
  onSelectReason: (reason: string) => void;
  note: string;
  onChangeNote: (value: string) => void;
};

export function LeaveReasonAndNoteSection({
  selectedReason,
  onSelectReason,
  note,
  onChangeNote,
}: LeaveReasonAndNoteSectionProps) {
  const [listening, setListening] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const toggleVoice = () => {
    if (listening) {
      return;
    }
    setListening(true);
    timeoutRef.current = setTimeout(() => {
      setListening(false);
      onChangeNote('Ghar me jaruri function hai, kindly approve karein.');
    }, 2500);
  };

  return (
    <View style={styles.section}>
      <View style={styles.headerRow}>
        <View style={styles.stepRow}>
          <View style={styles.stepBadge}>
            <Text style={styles.stepBadgeText}>3</Text>
          </View>
          <Text style={styles.stepTitle}>{applyForLeaveDefaults.step3Title}</Text>
        </View>
        <Text style={styles.hint}>{applyForLeaveDefaults.step3Hint}</Text>
      </View>

      <View style={styles.reasonsGrid}>
        {leaveReasonOptions.map((reason) => {
          const selected = reason === selectedReason;
          return (
            <Pressable
              key={reason}
              onPress={() => onSelectReason(reason)}
              style={[styles.reasonPill, selected && styles.reasonPillSelected]}
            >
              <Text style={[styles.reasonText, selected && styles.reasonTextSelected]}>
                {reason}
              </Text>
              <MaterialIcons
                name="check-circle"
                size={20}
                color={selected ? appColors.onPrimary : 'transparent'}
              />
            </Pressable>
          );
        })}
      </View>

      <View style={styles.noteCard}>
        <View style={styles.noteHeader}>
          <Text style={styles.noteLabel}>{applyForLeaveDefaults.noteLabel}</Text>
          <View style={styles.voiceHint}>
            <MaterialIcons name="record-voice-over" size={14} color={appColors.primary} />
            <Text style={styles.voiceHintText}>{applyForLeaveDefaults.noteVoiceHint}</Text>
          </View>
        </View>
        <View style={styles.noteRow}>
          <TextInput
            style={styles.noteInput}
            multiline
            value={note}
            onChangeText={onChangeNote}
            placeholder={
              listening
                ? 'Listening... Speak in Hindi or English...'
                : applyForLeaveDefaults.notePlaceholder
            }
            placeholderTextColor={appColors.secondary}
          />
          <Pressable
            accessibilityLabel="Tap to speak reason"
            onPress={toggleVoice}
            style={[styles.micButton, listening && styles.micButtonListening]}
          >
            <MaterialIcons
              name="mic"
              size={24}
              color={listening ? appColors.onError : appColors.primary}
            />
          </Pressable>
        </View>
      </View>
    </View>
  );
}
