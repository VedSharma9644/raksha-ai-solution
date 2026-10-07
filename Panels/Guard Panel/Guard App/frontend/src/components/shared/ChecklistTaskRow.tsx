import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { appColors } from '../../theme';
import { sharedChecklistTaskRowStyles as styles } from '../../styles/shared-checklist-task-row.styles';

type ChecklistTaskRowProps = {
  title: string;
  subtitle: string;
  done: boolean;
  highlightSubtitle?: boolean;
  onToggle: () => void;
};

export function ChecklistTaskRow({
  title,
  subtitle,
  done,
  highlightSubtitle = false,
  onToggle,
}: ChecklistTaskRowProps) {
  return (
    <Pressable
      onPress={onToggle}
      style={[styles.row, done ? styles.rowDone : styles.rowPending]}
    >
      <View style={styles.left}>
        <View style={[styles.checkbox, done && styles.checkboxDone]}>
          {done ? <MaterialIcons name="check" size={16} color={appColors.onPrimary} /> : null}
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={styles.title}>{title}</Text>
          <Text style={highlightSubtitle && !done ? styles.subtitleHighlight : styles.subtitle}>
            {subtitle}
          </Text>
        </View>
      </View>
      <MaterialIcons
        name={done ? 'check-circle' : 'radio-button-unchecked'}
        size={26}
        color={done ? appColors.primary : appColors.onSurfaceVariant}
      />
    </Pressable>
  );
}
