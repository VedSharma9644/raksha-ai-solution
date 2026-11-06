import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import {
  fetchMyPayroll,
  type GuardPayrollBreakdownDto,
} from '../../api/guard-api';
import { AttendanceMonthCycleSelector } from '../attendance-history/AttendanceMonthCycleSelector';
import { salaryPayrollDefaults as copy } from '../../constants/salary-payroll-defaults';
import { useGuardAppNavigation } from '../../navigation/useGuardAppNavigation';
import { salaryPayrollScreenStyles as styles } from '../../styles/salary-payroll-screen.styles';
import { appColors } from '../../theme';

function formatMoney(n: number): string {
  return `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}

function formatMonthLabel(year: number, month: number): string {
  return new Date(year, month - 1, 1).toLocaleString('en-IN', {
    month: 'long',
    year: 'numeric',
  });
}

function formatDayCount(n: number): string {
  const rounded = Math.round(n * 100) / 100;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

export function SalaryPayrollScreenContent() {
  const { authToken } = useGuardAppNavigation();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [breakdown, setBreakdown] = useState<GuardPayrollBreakdownDto | null>(null);
  const [disclaimer, setDisclaimer] = useState(copy.cycleNote);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!authToken) {
      setLoading(false);
      setError('Please sign in again.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await fetchMyPayroll(authToken, year, month);
      setBreakdown(result.breakdown);
      setDisclaimer(result.disclaimer || copy.cycleNote);
    } catch (err: unknown) {
      const message = (err as { message?: string }).message ?? 'Could not load salary.';
      setBreakdown(null);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [authToken, year, month]);

  useEffect(() => {
    void load();
  }, [load]);

  const shiftMonth = (delta: number) => {
    const cursor = new Date(year, month - 1 + delta, 1);
    setYear(cursor.getFullYear());
    setMonth(cursor.getMonth() + 1);
  };

  const periodLabel = breakdown?.period.label ?? formatMonthLabel(year, month);
  const cycleRange =
    breakdown?.period.startDate && breakdown?.period.endDate
      ? `${breakdown.period.startDate} → ${breakdown.period.endDate}`
      : copy.cycleNote;

  if (loading && !breakdown) {
    return (
      <View style={[styles.content, styles.centered]}>
        <ActivityIndicator size="large" color={appColors.primary} />
        <Text style={styles.loadingText}>{copy.loadingLabel}</Text>
      </View>
    );
  }

  if (error && !breakdown) {
    return (
      <View style={[styles.content, styles.centered]}>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable style={styles.retryButton} onPress={() => void load()}>
          <Text style={styles.retryLabel}>{copy.retryLabel}</Text>
        </Pressable>
      </View>
    );
  }

  const b = breakdown!;
  const hasSalary = b.monthlySalary > 0;
  const deductions = b.advanceDeductions ?? [];
  const deductionTotal = b.advanceDeductionTotal ?? 0;

  return (
    <View style={styles.content}>
      <AttendanceMonthCycleSelector
        monthLabel={periodLabel}
        cycleLabel={cycleRange}
        cycleNote={copy.cycleNote}
        onPrev={() => shiftMonth(-1)}
        onNext={() => shiftMonth(1)}
      />

      {!hasSalary ? (
        <Text style={styles.emptyNote}>{copy.emptySalaryNote}</Text>
      ) : (
        <>
          <View style={styles.heroCard}>
            <Text style={styles.heroLabel}>{copy.estimatedNetLabel}</Text>
            <Text style={styles.heroAmount}>{formatMoney(b.estimatedNet)}</Text>
            <Text style={styles.heroPeriod}>{periodLabel}</Text>
            <Text style={styles.disclaimer}>{disclaimer}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>{copy.payBreakdownTitle}</Text>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>{copy.monthlySalaryLabel}</Text>
              <Text style={styles.rowValue}>{formatMoney(b.monthlySalary)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>{copy.dayRateLabel}</Text>
              <Text style={[styles.rowValue, styles.rowValueMuted]}>
                {formatMoney(b.dayRate)}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
              <Text style={styles.rowLabel}>{copy.attendancePayLabel}</Text>
              <Text style={styles.rowValue}>{formatMoney(b.attendanceGross)}</Text>
            </View>
            {b.reliefBonusTotal > 0 ? (
              <View style={styles.row}>
                <Text style={styles.rowLabel}>{copy.reliefBonusLabel}</Text>
                <Text style={styles.rowValue}>{formatMoney(b.reliefBonusTotal)}</Text>
              </View>
            ) : null}
            <View style={styles.row}>
              <Text style={styles.rowLabel}>{copy.grossPayLabel}</Text>
              <Text style={styles.rowValue}>{formatMoney(b.estimatedGross)}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
              <Text style={styles.rowLabel}>{copy.deductionsLabel}</Text>
              <Text
                style={[
                  styles.rowValue,
                  deductionTotal > 0 ? styles.rowValueDeduct : styles.rowValueMuted,
                ]}
              >
                {deductionTotal > 0
                  ? `−${formatMoney(deductionTotal)}`
                  : copy.noDeductionsLabel}
              </Text>
            </View>
            {deductions.map((row) => (
              <View key={row.installmentId} style={styles.deductionRow}>
                <View style={styles.deductionCopy}>
                  <Text style={styles.deductionPurpose} numberOfLines={3}>
                    {row.label || row.purpose || copy.advanceDeductionLabel}
                  </Text>
                  {row.recoveryMode === 'emi' && row.installmentIndex != null ? (
                    <Text style={styles.deductionMeta}>
                      EMI {row.installmentIndex}
                      {row.emiMonths != null ? ` of ${row.emiMonths}` : ''}
                    </Text>
                  ) : null}
                </View>
                <Text style={styles.deductionAmount}>
                  −{formatMoney(row.amount)}
                </Text>
              </View>
            ))}
            <View style={[styles.row, styles.netRow]}>
              <Text style={styles.netLabel}>{copy.estimatedNetLabel}</Text>
              <Text style={styles.netValue}>{formatMoney(b.estimatedNet)}</Text>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>{copy.attendanceBreakdownTitle}</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCell}>
                <Text style={styles.statValue}>
                  {formatDayCount(b.breakdown.presentDays)}
                </Text>
                <Text style={styles.statLabel}>{copy.presentDaysLabel}</Text>
              </View>
              <View style={styles.statCell}>
                <Text style={styles.statValue}>
                  {formatDayCount(b.breakdown.halfDays)}
                </Text>
                <Text style={styles.statLabel}>{copy.halfDaysLabel}</Text>
              </View>
              <View style={styles.statCell}>
                <Text style={styles.statValue}>
                  {formatDayCount(b.breakdown.missedDays)}
                </Text>
                <Text style={styles.statLabel}>{copy.missedDaysLabel}</Text>
              </View>
              <View style={styles.statCell}>
                <Text style={styles.statValue}>
                  {formatDayCount(b.breakdown.leaveDays)}
                </Text>
                <Text style={styles.statLabel}>{copy.leaveDaysLabel}</Text>
              </View>
              <View style={styles.statCell}>
                <Text style={styles.statValue}>
                  {formatDayCount(b.breakdown.weeklyOffDays)}
                </Text>
                <Text style={styles.statLabel}>{copy.weeklyOffLabel}</Text>
              </View>
              <View style={styles.statCell}>
                <Text style={styles.statValue}>
                  {formatDayCount(b.breakdown.payableDays)}
                </Text>
                <Text style={styles.statLabel}>{copy.payableDaysLabel}</Text>
              </View>
            </View>
          </View>
        </>
      )}
    </View>
  );
}
