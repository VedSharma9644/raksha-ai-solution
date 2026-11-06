import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import {
  reliefMethodOptions,
  relieveAGuardDefaults,
  type ReliefMethodKey,
} from '../../constants/relieve-a-guard-defaults';
import { relieveMethodOptionsStyles as styles } from '../../styles/relieve-method-options.styles';
import { appColors } from '../../theme';

type RelieveMethodOptionsProps = {
  selectedMethod: ReliefMethodKey;
  onSelect: (method: ReliefMethodKey) => void;
};

export function RelieveMethodOptions({ selectedMethod, onSelect }: RelieveMethodOptionsProps) {
  return (
    <View style={styles.section}>
      <View style={styles.headerRow}>
        <View style={styles.stepBadge}>
          <Text style={styles.stepBadgeText}>2</Text>
        </View>
        <Text style={styles.stepTitle}>{relieveAGuardDefaults.step2Title}</Text>
      </View>

      <View style={styles.list}>
        {reliefMethodOptions.map((option) => {
          const selected = option.key === selectedMethod;
          return (
            <Pressable
              key={option.key}
              onPress={() => onSelect(option.key)}
              style={[styles.optionCard, selected && styles.optionCardSelected]}
            >
              <View style={styles.radioWrap}>
                <MaterialIcons
                  name={selected ? 'radio-button-checked' : 'radio-button-unchecked'}
                  size={28}
                  color={selected ? appColors.primary : appColors.outline}
                />
              </View>
              <View style={styles.optionCopy}>
                <View style={styles.titleRow}>
                  <Text style={styles.optionTitle}>{option.title}</Text>
                  {option.recommended ? (
                    <View style={styles.recommendedBadge}>
                      <Text style={styles.recommendedText}>Recommended</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={styles.optionDescription}>{option.description}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
