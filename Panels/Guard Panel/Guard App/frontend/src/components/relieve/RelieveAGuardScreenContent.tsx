import { useMemo, useState } from 'react';
import { View } from 'react-native';

import {
  reliefGuardOptions,
  type ReliefMethodKey,
  type ReliefReasonKey,
} from '../../constants/relieve-a-guard-defaults';
import { relieveAGuardScreenStyles as styles } from '../../styles/relieve-a-guard-screen.styles';
import { RelieveGuidanceBanner } from './RelieveGuidanceBanner';
import { RelieveGuardPicker } from './RelieveGuardPicker';
import { RelieveMethodOptions } from './RelieveMethodOptions';
import { RelieveProtocolNotice } from './RelieveProtocolNotice';
import { RelieveReasonSection } from './RelieveReasonSection';
import { RelieveShiftHandoverCard } from './RelieveShiftHandoverCard';
import { RelieveSubmitActions } from './RelieveSubmitActions';

type VoiceNoteState = 'idle' | 'recording' | 'attached';

export function RelieveAGuardScreenContent() {
  const [method, setMethod] = useState<ReliefMethodKey>('swap');
  const [selectedGuardId, setSelectedGuardId] = useState(reliefGuardOptions[0]?.id ?? '');
  const [selectedReason, setSelectedReason] = useState<ReliefReasonKey>('urgentFamily');
  const [voiceState, setVoiceState] = useState<VoiceNoteState>('idle');

  const selectedGuard = useMemo(
    () => reliefGuardOptions.find((guard) => guard.id === selectedGuardId) ?? reliefGuardOptions[0],
    [selectedGuardId],
  );

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
      <RelieveGuardPicker selectedGuardId={selectedGuardId} onSelect={setSelectedGuardId} />
      <RelieveReasonSection
        selectedReason={selectedReason}
        onSelectReason={setSelectedReason}
        voiceState={voiceState}
        onToggleVoice={toggleVoice}
      />
      <RelieveProtocolNotice selectedGuardName={selectedGuard?.name ?? 'Relief Guard'} />
      <RelieveSubmitActions method={method} guardName={selectedGuard?.name ?? 'Guard'} />
    </View>
  );
}
