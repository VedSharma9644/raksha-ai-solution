import { useState } from 'react';

import type { LeaveTypeKey } from '../../constants/apply-for-leave-defaults';
import { LeaveApplicationAssuranceBanner } from './LeaveApplicationAssuranceBanner';
import { LeaveBalanceQuotaCards } from './LeaveBalanceQuotaCards';
import { LeaveDateRangePicker } from './LeaveDateRangePicker';
import { LeaveDutyCoverNotice } from './LeaveDutyCoverNotice';
import { LeaveReasonAndNoteSection } from './LeaveReasonAndNoteSection';
import { LeaveSubmitActionButtons } from './LeaveSubmitActionButtons';
import { LeaveTypeOptionList } from './LeaveTypeOptionList';

export function ApplyForLeaveScreenContent() {
  const [leaveType, setLeaveType] = useState<LeaveTypeKey>('CL');
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [selectedReason, setSelectedReason] = useState('Family Function / Wedding');
  const [note, setNote] = useState('');

  return (
    <>
      <LeaveApplicationAssuranceBanner />
      <LeaveBalanceQuotaCards />
      <LeaveTypeOptionList selectedType={leaveType} onSelect={setLeaveType} />
      <LeaveDateRangePicker
        selectedPreset={selectedPreset}
        onSelectPreset={setSelectedPreset}
      />
      <LeaveReasonAndNoteSection
        selectedReason={selectedReason}
        onSelectReason={setSelectedReason}
        note={note}
        onChangeNote={setNote}
      />
      <LeaveDutyCoverNotice />
      <LeaveSubmitActionButtons />
    </>
  );
}
