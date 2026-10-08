import { useState } from 'react';
import { View } from 'react-native';

import type { ReliefMethodKey, ReliefReasonKey } from '../../constants/relieve-a-guard-defaults';
import { relieveAGuardScreenStyles as styles } from '../../styles/relieve-a-guard-screen.styles';
import { RelieveAssignmentInfoCard } from './RelieveAssignmentInfoCard';
import { RelieveGuidanceBanner } from './RelieveGuidanceBanner';
import { RelieveMethodOptions } from './RelieveMethodOptions';
import { RelieveProtocolNotice } from './RelieveProtocolNotice';
import { RelieveReasonSection } from './RelieveReasonSection';
import { RelieveShiftHandoverCard } from './RelieveShiftHandoverCard';
import { RelieveSubmitActions } from './RelieveSubmitActions';

type VoiceNoteState = 'idle' | 'recording' | 'attached';

export function RelieveAGuardScreenContent() {
  const [method, setMethod] = useState<ReliefMethodKey>('remaining');
  const [selectedReason, setSelectedReason] = useState<ReliefReasonKey>('urgentFamily');
  const [voiceState, setVoiceState] = useState<VoiceNoteState>('idle');

  const toggleVoice = () => {
    setVoiceState((current) => {
      if (current === 'idle' || current === 'attached') {
        return 'recording';
      }
      return 'attached';
    });
  };

  return (
    <View style={styles.content}>
      <RelieveGuidanceBanner />
      <RelieveShiftHandoverCard />
      <RelieveMethodOptions selectedMethod={method} onSelect={setMethod} />
      <RelieveAssignmentInfoCard />
      <RelieveReasonSection
        selectedReason={selectedReason}
        onSelectReason={setSelectedReason}
        voiceState={voiceState}
        onToggleVoice={toggleVoice}
      />
      <RelieveProtocolNotice />
      <RelieveSubmitActions method={method} reason={selectedReason} />
    </View>
  );
}
