import { MaterialIcons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { useEffect, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { applyForLeaveDefaults } from '../../constants/apply-for-leave-defaults';
import { useGuardAppNavigation } from '../../navigation/useGuardAppNavigation';
import { appColors } from '../../theme';
import { leaveSubmitActionButtonsStyles as styles } from '../../styles/leave-submit-action-buttons.styles';

export function LeaveSubmitActionButtons() {
  const { openLeaveTimeOff } = useGuardAppNavigation();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const submit = () => {
    if (submitting || submitted) {
      return;
    }
    setSubmitting(true);
    timeoutRef.current = setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 1200);
  };

  const primaryLabel = submitting
    ? 'Submitting to Amit Singh...'
    : submitted
      ? 'Request Sent Successfully!'
      : applyForLeaveDefaults.submitLabel;

  const primaryIcon = submitting ? 'hourglass-empty' : submitted ? 'done-all' : 'send';

  return (
    <View style={styles.section}>
      <Pressable
        style={({ pressed }) => [
          styles.primaryButton,
          submitted && styles.primaryButtonSuccess,
          pressed && styles.primaryButtonPressed,
        ]}
        onPress={submit}
      >
        <MaterialIcons name={primaryIcon} size={24} color={appColors.onPrimary} />
        <Text style={styles.primaryLabel}>{primaryLabel}</Text>
      </Pressable>

      <Pressable
        style={({ pressed }) => [styles.secondaryButton, pressed && styles.secondaryButtonPressed]}
        onPress={openLeaveTimeOff}
      >
        <MaterialIcons name="history" size={20} color={appColors.secondary} />
        <Text style={styles.secondaryLabel}>{applyForLeaveDefaults.pastLeavesLabel}</Text>
      </Pressable>

      <View style={styles.urgentRow}>
        <MaterialIcons name="phone-in-talk" size={18} color={appColors.tertiary} />
        <Text style={styles.urgentText}>
          {applyForLeaveDefaults.urgentHelpPrefix}{' '}
          <Text
            style={styles.urgentLink}
            onPress={() => Linking.openURL(`tel:${applyForLeaveDefaults.controlRoomTel}`)}
          >
            {applyForLeaveDefaults.controlRoomLabel}
          </Text>
        </Text>
      </View>
    </View>
  );
}
