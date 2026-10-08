import { MaterialIcons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';

import { submitReliefRequest } from '../../api/guard-api';
import {
  buildReliefCtaLabel,
  relieveAGuardDefaults,
  type ReliefMethodKey,
  type ReliefReasonKey,
} from '../../constants/relieve-a-guard-defaults';
import { useGuardDutyAssignment } from '../../hooks/useGuardDutyAssignment';
import { useGuardAppNavigation } from '../../navigation/useGuardAppNavigation';
import { relieveSubmitActionsStyles as styles } from '../../styles/relieve-submit-actions.styles';
import { appColors } from '../../theme';

type RelieveSubmitActionsProps = {
  method: ReliefMethodKey;
  reason: ReliefReasonKey;
};

function todayDutyDate(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function RelieveSubmitActions({ method, reason }: RelieveSubmitActionsProps) {
  const { authToken, openIncomingReliefRequests, guardUser } = useGuardAppNavigation();
  const duty = useGuardDutyAssignment();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState(relieveAGuardDefaults.toastMessage);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  const submit = async () => {
    if (submitting || submitted) {
      return;
    }
    if (!authToken) {
      Alert.alert('Session', 'Please log in again to submit a relief request.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await submitReliefRequest(authToken, {
        method,
        reason,
        dutyDate: todayDutyDate(),
        shiftFrom: duty.shiftFrom,
        shiftTo: duty.shiftTo,
        siteId: guardUser?.assignedSiteId,
        siteName: duty.siteName,
        postName: duty.postName,
        handoverFrom: method === 'remaining' ? new Date().toISOString() : undefined,
      });
      setSubmitted(true);
      setToastMessage(result.message || relieveAGuardDefaults.toastMessage);
      setShowToast(true);
      toastTimeoutRef.current = setTimeout(() => setShowToast(false), 4000);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to submit relief request.';
      Alert.alert('Relief request', message);
    } finally {
      setSubmitting(false);
    }
  };

  const ctaLabel = submitting
    ? relieveAGuardDefaults.submittingLabel
    : submitted
      ? relieveAGuardDefaults.submittedLabel
      : buildReliefCtaLabel(method);

  const ctaIcon = submitting ? 'hourglass-empty' : submitted ? 'check' : 'send';

  return (
    <View style={styles.section}>
      <Pressable
        style={({ pressed }) => [
          styles.primaryButton,
          submitted && styles.primaryButtonSuccess,
          pressed && styles.primaryButtonPressed,
        ]}
        onPress={() => {
          void submit();
        }}
      >
        <MaterialIcons name={ctaIcon} size={26} color={appColors.onPrimary} />
        <Text style={styles.primaryLabel}>{ctaLabel}</Text>
      </Pressable>

      <Pressable
        style={({ pressed }) => [styles.historyButton, pressed && styles.historyButtonPressed]}
        onPress={openIncomingReliefRequests}
      >
        <MaterialIcons name="history" size={22} color={appColors.onSurfaceVariant} />
        <Text style={styles.historyLabel}>{relieveAGuardDefaults.historyLabel}</Text>
      </Pressable>

      {showToast ? (
        <View style={styles.toast}>
          <MaterialIcons name="check-circle" size={28} color={appColors.primaryFixed} />
          <View style={styles.toastCopy}>
            <Text style={styles.toastTitle}>{relieveAGuardDefaults.toastTitle}</Text>
            <Text style={styles.toastMessage}>{toastMessage}</Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}
