import { MaterialIcons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';

import {
  applyForLeaveDefaults,
  leaveDatePresets,
} from '../../constants/apply-for-leave-defaults';
import { appColors } from '../../theme';
import { leaveDateRangePickerStyles as styles } from '../../styles/leave-date-range-picker.styles';
import {
  addDays,
  formatDurationMeta,
  formatDurationValue,
  formatLeaveDayMeta,
  formatLeaveDayValue,
  inclusiveDayCount,
  startOfDay,
} from '../../utils/leave-dates';

type LeaveDateRangePickerProps = {
  startDate: Date;
  endDate: Date;
  selectedPreset: string | null;
  onChangeRange: (start: Date, end: Date, presetKey?: string | null) => void;
};

type PickerTarget = 'start' | 'end';

export function LeaveDateRangePicker({
  startDate,
  endDate,
  selectedPreset,
  onChangeRange,
}: LeaveDateRangePickerProps) {
  const [pickerTarget, setPickerTarget] = useState<PickerTarget | null>(null);
  const [draft, setDraft] = useState<Date>(startDate);

  const dayCount = useMemo(
    () => inclusiveDayCount(startDate, endDate),
    [startDate, endDate],
  );

  const openPicker = (target: PickerTarget) => {
    setDraft(target === 'start' ? startDate : endDate);
    setPickerTarget(target);
  };

  const commitDraft = () => {
    if (!pickerTarget) {
      return;
    }
    const next = startOfDay(draft);
    if (pickerTarget === 'start') {
      const end = endDate < next ? next : endDate;
      onChangeRange(next, end, null);
    } else {
      const start = startDate > next ? next : startDate;
      onChangeRange(start, next, null);
    }
    setPickerTarget(null);
  };

  const shiftDraft = (delta: number) => {
    const today = startOfDay(new Date());
    const next = addDays(draft, delta);
    if (next < today) {
      setDraft(today);
      return;
    }
    setDraft(next);
  };

  return (
    <View style={styles.section}>
      <View style={styles.headerRow}>
        <View style={styles.stepRow}>
          <View style={styles.stepBadge}>
            <Text style={styles.stepBadgeText}>2</Text>
          </View>
          <Text style={styles.stepTitle}>{applyForLeaveDefaults.step2Title}</Text>
        </View>
        <Text style={styles.hint}>{applyForLeaveDefaults.step2Hint}</Text>
      </View>

      <View style={styles.dateGrid}>
        <Pressable
          style={({ pressed }) => [styles.dateCard, pressed && styles.dateCardPressed]}
          onPress={() => openPicker('start')}
        >
          <View style={styles.dateCardHeader}>
            <Text style={styles.dateCardLabel}>{applyForLeaveDefaults.startDateLabel}</Text>
            <MaterialIcons name="calendar-today" size={18} color={appColors.primary} />
          </View>
          <Text style={styles.dateValue}>{formatLeaveDayValue(startDate)}</Text>
          <Text style={styles.dateMeta}>{formatLeaveDayMeta(startDate)}</Text>
          <View style={styles.dateUnderline} />
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.dateCard, pressed && styles.dateCardPressed]}
          onPress={() => openPicker('end')}
        >
          <View style={styles.dateCardHeader}>
            <Text style={styles.dateCardLabel}>{applyForLeaveDefaults.endDateLabel}</Text>
            <MaterialIcons name="event-available" size={18} color={appColors.primary} />
          </View>
          <Text style={styles.dateValue}>{formatLeaveDayValue(endDate)}</Text>
          <Text style={styles.dateMeta}>{formatLeaveDayMeta(endDate)}</Text>
          <View style={styles.dateUnderline} />
        </Pressable>
      </View>

      <View style={styles.durationBanner}>
        <View style={styles.durationLeft}>
          <MaterialIcons name="timelapse" size={20} color={appColors.primary} />
          <Text style={styles.durationLabel}>{applyForLeaveDefaults.durationLabel}</Text>
        </View>
        <View style={styles.durationRight}>
          <Text style={styles.durationValue}>{formatDurationValue(dayCount)}</Text>
          <Text style={styles.durationMeta}>{formatDurationMeta(dayCount)}</Text>
        </View>
      </View>

      <View style={styles.presetsRow}>
        {leaveDatePresets.map((preset) => {
          const selected = selectedPreset === preset.key;
          return (
            <Pressable
              key={preset.key}
              onPress={() => {
                // Parent resolves preset into concrete dates.
                onChangeRange(startDate, endDate, preset.key);
              }}
              style={[styles.presetChip, selected && styles.presetChipSelected]}
            >
              <MaterialIcons
                name={preset.icon}
                size={16}
                color={selected ? appColors.onPrimary : appColors.secondary}
              />
              <Text style={[styles.presetLabel, selected && styles.presetLabelSelected]}>
                {preset.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Modal
        visible={pickerTarget !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setPickerTarget(null)}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: 'rgba(15, 23, 42, 0.45)',
            justifyContent: 'center',
            padding: 24,
          }}
          onPress={() => setPickerTarget(null)}
        >
          <Pressable
            onPress={(event) => event.stopPropagation()}
            style={{
              backgroundColor: appColors.surface,
              borderRadius: 16,
              padding: 20,
              gap: 16,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: '700', color: appColors.onSurface }}>
              {pickerTarget === 'start' ? 'Select start date' : 'Select end date'}
            </Text>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Pressable
                onPress={() => shiftDraft(-1)}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: appColors.surfaceContainerHigh,
                }}
              >
                <MaterialIcons name="chevron-left" size={28} color={appColors.primary} />
              </Pressable>

              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 22, fontWeight: '700', color: appColors.onSurface }}>
                  {formatLeaveDayValue(draft)}
                </Text>
                <Text style={{ fontSize: 13, color: appColors.secondary, marginTop: 4 }}>
                  {formatLeaveDayMeta(draft)}
                </Text>
              </View>

              <Pressable
                onPress={() => shiftDraft(1)}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: appColors.surfaceContainerHigh,
                }}
              >
                <MaterialIcons name="chevron-right" size={28} color={appColors.primary} />
              </Pressable>
            </View>

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Pressable
                onPress={() => setPickerTarget(null)}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 12,
                  alignItems: 'center',
                  backgroundColor: appColors.surfaceContainerHigh,
                }}
              >
                <Text style={{ color: appColors.secondary, fontWeight: '600' }}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={commitDraft}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 12,
                  alignItems: 'center',
                  backgroundColor: appColors.primary,
                }}
              >
                <Text style={{ color: appColors.onPrimary, fontWeight: '700' }}>Done</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
