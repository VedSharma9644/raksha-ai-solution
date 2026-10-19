import { useState } from 'react';
import { View } from 'react-native';

import type { ReliefMethodKey, ReliefReasonKey } from '../../constants/relieve-a-guard-defaults';
import { relieveAGuardScreenStyles as styles } from '../../styles/relieve-a-guard-screen.styles';
import {
  addDaysToIstDutyDate,
  toIstDutyDateKey,
} from '../../utils/ist-date';
import { RelieveAssignmentInfoCard } from './RelieveAssignmentInfoCard';
import { RelieveGuidanceBanner } from './RelieveGuidanceBanner';
import { RelieveMethodOptions } from './RelieveMethodOptions';
import { RelieveProtocolNotice } from './RelieveProtocolNotice';
import { RelieveReasonSection } from './RelieveReasonSection';
import { RelieveShiftHandoverCard } from './RelieveShiftHandoverCard';
import { RelieveSubmitActions } from './RelieveSubmitActions';

export function RelieveAGuardScreenContent() {
  const [method, setMethod] = useState<ReliefMethodKey>('remaining');
  const [selectedReason, setSelectedReason] = useState<ReliefReasonKey>('urgentFamily');
  const [note, setNote] = useState('');
  const [dutyDate, setDutyDate] = useState(() => toIstDutyDateKey());

  const cycleDutyDate = () => {
    const today = toIstDutyDateKey();
    const tomorrow = addDaysToIstDutyDate(today, 1);
    setDutyDate((current) => (current === today ? tomorrow : today));
  };

  return (
    <View style={styles.content}>
      <RelieveGuidanceBanner />
      <RelieveShiftHandoverCard
        dutyDate={dutyDate}
        onCycleDutyDate={cycleDutyDate}
      />
      <RelieveMethodOptions selectedMethod={method} onSelect={setMethod} />
      <RelieveAssignmentInfoCard />
      <RelieveReasonSection
        selectedReason={selectedReason}
        onSelectReason={setSelectedReason}
        note={note}
        onChangeNote={setNote}
      />
      <RelieveProtocolNotice />
      <RelieveSubmitActions
        method={method}
        reason={selectedReason}
        dutyDate={dutyDate}
        note={note}
      />
    </View>
  );
}
