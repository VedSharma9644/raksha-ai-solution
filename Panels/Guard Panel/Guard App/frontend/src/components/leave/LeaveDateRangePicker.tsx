import { MaterialIcons } from '@expo/vector-icons';
import { Alert, Pressable, Text, View } from 'react-native';

import {
  applyForLeaveDefaults,
  leaveDatePresets,
} from '../../constants/apply-for-leave-defaults';
import { appColors } from '../../theme';
import { leaveDateRangePickerStyles as styles } from '../../styles/leave-date-range-picker.styles';

type LeaveDateRangePickerProps = {
  selectedPreset: string | null;
  onSelectPreset: (key: string) => void;
};

export function LeaveDateRangePicker({
  selectedPreset,
  onSelectPreset,
}: LeaveDateRangePickerProps) {
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
          onPress={() => Alert.alert('Start Date', 'Date picker will open here soon.')}
        >
          <View style={styles.dateCardHeader}>
            <Text style={styles.dateCardLabel}>{applyForLeaveDefaults.startDateLabel}</Text>
            <MaterialIcons name="calendar-today" size={18} color={appColors.primary} />
          </View>
          <Text style={styles.dateValue}>{applyForLeaveDefaults.startDateValue}</Text>
          <Text style={styles.dateMeta}>{applyForLeaveDefaults.startDateMeta}</Text>
          <View style={styles.dateUnderline} />
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.dateCard, pressed && styles.dateCardPressed]}
          onPress={() => Alert.alert('End Date', 'Date picker will open here soon.')}
        >
          <View style={styles.dateCardHeader}>
            <Text style={styles.dateCardLabel}>{applyForLeaveDefaults.endDateLabel}</Text>
            <MaterialIcons name="event-available" size={18} color={appColors.primary} />
          </View>
          <Text style={styles.dateValue}>{applyForLeaveDefaults.endDateValue}</Text>
          <Text style={styles.dateMeta}>{applyForLeaveDefaults.endDateMeta}</Text>
          <View style={styles.dateUnderline} />
        </Pressable>
      </View>

      <View style={styles.durationBanner}>
        <View style={styles.durationLeft}>
          <MaterialIcons name="timelapse" size={20} color={appColors.primary} />
          <Text style={styles.durationLabel}>{applyForLeaveDefaults.durationLabel}</Text>
        </View>
        <View style={styles.durationRight}>
          <Text style={styles.durationValue}>{applyForLeaveDefaults.durationValue}</Text>
          <Text style={styles.durationMeta}>{applyForLeaveDefaults.durationMeta}</Text>
        </View>
      </View>

      <View style={styles.presetsRow}>
        {leaveDatePresets.map((preset) => {
          const selected = selectedPreset === preset.key;
          return (
            <Pressable
              key={preset.key}
              onPress={() => onSelectPreset(preset.key)}
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
    </View>
  );
}
