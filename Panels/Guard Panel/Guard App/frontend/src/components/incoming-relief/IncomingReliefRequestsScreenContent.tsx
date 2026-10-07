import { MaterialIcons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';

import {
  sentReliefRequest,
  swapProposalRequest,
  urgentCoverRequest,
  type IncomingReliefTab,
} from '../../constants/incoming-relief-requests-defaults';
import { incomingReliefRequestsScreenStyles as styles } from '../../styles/incoming-relief-requests-screen.styles';
import { appColors } from '../../theme';
import { IncomingCompletedHandovers } from './IncomingCompletedHandovers';
import { IncomingEmergencySupportCard } from './IncomingEmergencySupportCard';
import { IncomingReliefIncentiveBanner } from './IncomingReliefIncentiveBanner';
import { IncomingReliefRosterBar } from './IncomingReliefRosterBar';
import { IncomingReliefTabSwitcher } from './IncomingReliefTabSwitcher';
import { IncomingSentRequestCard } from './IncomingSentRequestCard';
import { IncomingSwapProposalCard } from './IncomingSwapProposalCard';
import { IncomingUrgentCoverCard } from './IncomingUrgentCoverCard';

type ToastState = {
  message: string;
  icon: keyof typeof MaterialIcons.glyphMap;
} | null;

export function IncomingReliefRequestsScreenContent() {
  const [activeTab, setActiveTab] = useState<IncomingReliefTab>('incoming');
  const [urgentDismissed, setUrgentDismissed] = useState(false);
  const [swapDismissed, setSwapDismissed] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dismissTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
      if (dismissTimeoutRef.current) {
        clearTimeout(dismissTimeoutRef.current);
      }
    };
  }, []);

  const showToast = (message: string, icon: keyof typeof MaterialIcons.glyphMap = 'check-circle') => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToast({ message, icon });
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  const dismissAfter = (action: () => void) => {
    if (dismissTimeoutRef.current) {
      clearTimeout(dismissTimeoutRef.current);
    }
    dismissTimeoutRef.current = setTimeout(action, 1200);
  };

  return (
    <View style={styles.content}>
      <IncomingReliefRosterBar />
      <IncomingReliefTabSwitcher activeTab={activeTab} onChange={setActiveTab} />
      <IncomingReliefIncentiveBanner />

      {activeTab === 'incoming' ? (
        <View style={styles.feed}>
          <IncomingUrgentCoverCard
            dismissed={urgentDismissed}
            onAccept={() => {
              showToast(urgentCoverRequest.acceptToast);
              dismissAfter(() => setUrgentDismissed(true));
            }}
            onDecline={() => {
              showToast(urgentCoverRequest.declineToast, 'info');
              dismissAfter(() => setUrgentDismissed(true));
            }}
          />
          <IncomingSwapProposalCard
            dismissed={swapDismissed}
            onAccept={() => {
              showToast(swapProposalRequest.acceptToast);
              dismissAfter(() => setSwapDismissed(true));
            }}
            onReject={() => {
              showToast(swapProposalRequest.rejectToast, 'cancel');
              dismissAfter(() => setSwapDismissed(true));
            }}
          />
        </View>
      ) : (
        <View style={styles.feed}>
          <IncomingSentRequestCard
            onWithdraw={() => showToast(sentReliefRequest.withdrawToast, 'delete')}
          />
        </View>
      )}

      <IncomingCompletedHandovers />
      <IncomingEmergencySupportCard />

      {toast ? (
        <View style={styles.toast}>
          <MaterialIcons name={toast.icon} size={24} color={appColors.primaryFixed} />
          <Text style={styles.toastMessage}>{toast.message}</Text>
        </View>
      ) : null}
    </View>
  );
}
