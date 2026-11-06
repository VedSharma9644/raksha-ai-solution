import { MaterialIcons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { showAlert } from '../../alerts/appAlert';

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
import { toIstDutyDateKey } from '../../utils/ist-date';

type RelieveSubmitActionsProps = {
  method: ReliefMethodKey;
  reason: ReliefReasonKey;
  /** Optional override; defaults to today's IST duty date. */
  dutyDate?: string;
  note?: string;
};

export function RelieveSubmitActions({
  method,
  reason,
  dutyDate,
  note,
}: RelieveSubmitActionsProps) {
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
      showAlert('Session', 'Please log in again to submit a relief request.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await submitReliefRequest(authToken, {
        method,
        reason,
        note: note?.trim() || undefined,
        dutyDate: dutyDate?.trim() || toIstDutyDateKey(),
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
      showAlert('Relief request', message);
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
        disabled={submitting || submitted}
        accessibilityRole="button"
        accessibilityLabel={ctaLabel}
      >
        <MaterialIcons
          name={ctaIcon}
          size={22}
          color={appColors.onPrimary}
          style={styles.primaryIcon}
        />
        <Text style={styles.primaryLabel} numberOfLines={1}>
          {ctaLabel}
        </Text>
      </Pressable>

      <Pressable
        style={({ pressed }) => [styles.historyButton, pressed && styles.historyButtonPressed]}
        onPress={openIncomingReliefRequests}
        accessibilityRole="button"
      >
        <MaterialIcons name="history" size={20} color={appColors.onSurfaceVariant} />
        <Text style={styles.historyLabel} numberOfLines={1}>
          {relieveAGuardDefaults.historyLabel}
        </Text>
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
