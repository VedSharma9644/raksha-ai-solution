import { MaterialIcons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import {
  buildReliefCtaLabel,
  relieveAGuardDefaults,
  type ReliefMethodKey,
} from '../../constants/relieve-a-guard-defaults';
import { useGuardAppNavigation } from '../../navigation/useGuardAppNavigation';
import { relieveSubmitActionsStyles as styles } from '../../styles/relieve-submit-actions.styles';
import { appColors } from '../../theme';

type RelieveSubmitActionsProps = {
  method: ReliefMethodKey;
  guardName: string;
};

export function RelieveSubmitActions({ method, guardName }: RelieveSubmitActionsProps) {
  const { openIncomingReliefRequests } = useGuardAppNavigation();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const submitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (submitTimeoutRef.current) {
        clearTimeout(submitTimeoutRef.current);
      }
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  const submit = () => {
    if (submitting || submitted) {
      return;
    }
    setSubmitting(true);
    submitTimeoutRef.current = setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      setShowToast(true);
      toastTimeoutRef.current = setTimeout(() => {
        setShowToast(false);
      }, 4000);
    }, 1200);
  };

  const ctaLabel = submitting
    ? relieveAGuardDefaults.submittingLabel
    : submitted
      ? relieveAGuardDefaults.submittedLabel
      : buildReliefCtaLabel(method, guardName);

  const ctaIcon = submitting ? 'hourglass-empty' : submitted ? 'check' : 'send';

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
            <Text style={styles.toastMessage} numberOfLines={1}>
              {relieveAGuardDefaults.toastMessage}
            </Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}
