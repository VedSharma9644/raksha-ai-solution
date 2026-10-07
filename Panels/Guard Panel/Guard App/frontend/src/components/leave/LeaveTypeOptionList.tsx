import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import {
  applyForLeaveDefaults,
  leaveTypeOptions,
  type LeaveTypeKey,
} from '../../constants/apply-for-leave-defaults';
import { appColors } from '../../theme';
import { leaveTypeOptionListStyles as styles } from '../../styles/leave-type-option-list.styles';

type LeaveTypeOptionListProps = {
  selectedType: LeaveTypeKey;
  onSelect: (key: LeaveTypeKey) => void;
};

function iconWrapStyle(tone: 'paid' | 'neutral' | 'urgent') {
  if (tone === 'paid') return styles.iconPaid;
  if (tone === 'urgent') return styles.iconUrgent;
  return styles.iconNeutral;
}

function iconColor(tone: 'paid' | 'neutral' | 'urgent') {
  if (tone === 'paid') return appColors.onPrimaryFixed;
  if (tone === 'urgent') return appColors.error;
  return appColors.secondary;
}

export function LeaveTypeOptionList({ selectedType, onSelect }: LeaveTypeOptionListProps) {
  return (
    <View style={styles.section}>
      <View style={styles.stepRow}>
        <View style={styles.stepBadge}>
          <Text style={styles.stepBadgeText}>1</Text>
        </View>
        <Text style={styles.stepTitle}>{applyForLeaveDefaults.step1Title}</Text>
      </View>

      <View style={styles.list}>
        {leaveTypeOptions.map((option) => {
          const selected = option.key === selectedType;
          return (
            <Pressable
              key={option.key}
              onPress={() => onSelect(option.key)}
              style={[styles.option, selected && styles.optionSelected]}
            >
              <View style={styles.optionLeft}>
                <View style={[styles.iconWrap, iconWrapStyle(option.iconTone)]}>
                  <MaterialIcons
                    name={option.icon}
                    size={24}
                    color={iconColor(option.iconTone)}
                  />
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <View style={styles.titleRow}>
                    <Text style={styles.title}>{option.title}</Text>
                    {option.paidBadge ? (
                      <View style={styles.paidBadge}>
                        <Text style={styles.paidBadgeText}>{option.paidBadge}</Text>
                      </View>
                    ) : null}
                  </View>
                  <Text style={styles.subtitle}>{option.subtitle}</Text>
                </View>
              </View>
              <View style={[styles.radio, selected && styles.radioSelected]}>
                {selected ? (
                  <MaterialIcons name="check" size={18} color={appColors.onPrimary} />
                ) : null}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
