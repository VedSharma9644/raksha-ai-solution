import { MaterialIcons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';

import { applyForLeaveDefaults } from '../../constants/apply-for-leave-defaults';
import {
  formatPhoneDisplay,
  toTelHref,
  useGuardProfile,
} from '../../hooks/useGuardProfile';
import { useGuardAppNavigation } from '../../navigation/useGuardAppNavigation';
import { appColors } from '../../theme';
import { leaveSubmitActionButtonsStyles as styles } from '../../styles/leave-submit-action-buttons.styles';

type LeaveSubmitActionButtonsProps = {
  onSubmit: () => Promise<void>;
  disabled?: boolean;
};

export function LeaveSubmitActionButtons({
  onSubmit,
  disabled,
}: LeaveSubmitActionButtonsProps) {
  const { openLeaveTimeOff } = useGuardAppNavigation();
  const { profile } = useGuardProfile();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const hrName = profile?.site.hrName?.trim() || 'Site HR';
  const hrContact = profile?.site.hrContact?.trim() || '';
  const hrTel = toTelHref(hrContact);

  const submit = async () => {
    if (submitting || submitted || disabled) {
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit();
      setSubmitted(true);
    } catch (error: unknown) {
      const err = error as { message?: string };
      Alert.alert('Could not submit', err.message ?? 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const primaryLabel = submitting
    ? 'Submitting request...'
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
          (submitting || disabled) && { opacity: 0.75 },
        ]}
        onPress={() => {
          void submit();
        }}
        disabled={submitting || submitted || disabled}
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

      {hrTel ? (
        <View style={styles.urgentRow}>
          <MaterialIcons name="phone-in-talk" size={18} color={appColors.tertiary} />
          <Text style={styles.urgentText}>
            Urgent? Call{' '}
            <Text
              style={styles.urgentLink}
              onPress={() => Linking.openURL(`tel:${hrTel}`)}
            >
              {hrName} ({formatPhoneDisplay(hrContact)})
            </Text>
          </Text>
        </View>
      ) : null}
    </View>
  );
}
