import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';

import {
  fetchLeaveBalances,
  submitLeaveRequest,
  type LeaveBalanceSummaryDto,
} from '../../api/guard-api';
import type { LeaveTypeKey } from '../../constants/apply-for-leave-defaults';
import { useGuardAppNavigation } from '../../navigation/useGuardAppNavigation';
import {
  defaultLeaveRange,
  resolveLeavePreset,
  toDateKey,
} from '../../utils/leave-dates';
import { LeaveApplicationAssuranceBanner } from './LeaveApplicationAssuranceBanner';
import { LeaveBalanceQuotaCards } from './LeaveBalanceQuotaCards';
import { LeaveDateRangePicker } from './LeaveDateRangePicker';
import { LeaveDutyCoverNotice } from './LeaveDutyCoverNotice';
import { LeaveReasonAndNoteSection } from './LeaveReasonAndNoteSection';
import { LeaveSubmitActionButtons } from './LeaveSubmitActionButtons';
import { LeaveTypeOptionList } from './LeaveTypeOptionList';

export function ApplyForLeaveScreenContent() {
  const { authToken, guardUser, openLeaveTimeOff } = useGuardAppNavigation();
  const initialRange = defaultLeaveRange();

  const [leaveType, setLeaveType] = useState<LeaveTypeKey>('CL');
  const [startDate, setStartDate] = useState(initialRange.start);
  const [endDate, setEndDate] = useState(initialRange.end);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [selectedReason, setSelectedReason] = useState('Family Function / Wedding');
  const [note, setNote] = useState('');
  const [balance, setBalance] = useState<LeaveBalanceSummaryDto | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(false);

  const loadBalances = useCallback(async () => {
    if (!authToken) {
      return;
    }
    setLoadingBalance(true);
    try {
      const data = await fetchLeaveBalances(authToken);
      setBalance(data);
    } catch (error: unknown) {
      const err = error as { message?: string };
      Alert.alert('Leave balance', err.message ?? 'Could not load leave balances.');
    } finally {
      setLoadingBalance(false);
    }
  }, [authToken]);

  useEffect(() => {
    void loadBalances();
  }, [loadBalances]);

  const handleRangeChange = (start: Date, end: Date, presetKey?: string | null) => {
    if (presetKey) {
      const resolved = resolveLeavePreset(presetKey);
      if (resolved) {
        setStartDate(resolved.start);
        setEndDate(resolved.end);
        setSelectedPreset(presetKey);
        return;
      }
    }
    setStartDate(start);
    setEndDate(end);
    setSelectedPreset(presetKey ?? null);
  };

  const handleSubmit = async () => {
    if (!authToken) {
      throw new Error('Please sign in again to submit leave.');
    }
    if (!selectedReason.trim()) {
      throw new Error('Please select a reason for leave.');
    }

    const result = await submitLeaveRequest(authToken, {
      leaveType,
      startDate: toDateKey(startDate),
      endDate: toDateKey(endDate),
      reason: selectedReason,
      note,
    });

    await loadBalances();
    Alert.alert('Request submitted', result.message, [
      { text: 'View status', onPress: openLeaveTimeOff },
      { text: 'OK' },
    ]);
  };

  return (
    <>
      <LeaveApplicationAssuranceBanner />
      <LeaveBalanceQuotaCards types={balance?.types} loading={loadingBalance} />
      <LeaveTypeOptionList
        selectedType={leaveType}
        onSelect={setLeaveType}
        balances={balance?.types}
      />
      <LeaveDateRangePicker
        startDate={startDate}
        endDate={endDate}
        selectedPreset={selectedPreset}
        onChangeRange={handleRangeChange}
      />
      <LeaveReasonAndNoteSection
        selectedReason={selectedReason}
        onSelectReason={setSelectedReason}
        note={note}
        onChangeNote={setNote}
      />
      <LeaveDutyCoverNotice
        siteName={balance?.coverSite || guardUser?.siteName}
        supervisorName={balance?.coverSupervisor}
      />
      <LeaveSubmitActionButtons onSubmit={handleSubmit} disabled={!authToken} />
    </>
  );
}
