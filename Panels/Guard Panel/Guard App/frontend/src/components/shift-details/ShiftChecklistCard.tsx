import { MaterialIcons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import {
  shiftChecklistSeedItems,
  shiftDetailsDefaults,
  type ShiftChecklistItem,
} from '../../constants/shift-details-defaults';
import { appColors } from '../../theme';
import { shiftChecklistCardStyles as styles } from '../../styles/shift-checklist-card.styles';
import { ChecklistTaskRow } from '../shared/ChecklistTaskRow';

export function ShiftChecklistCard() {
  const [items, setItems] = useState<ShiftChecklistItem[]>(shiftChecklistSeedItems);

  const doneCount = useMemo(() => items.filter((item) => item.done).length, [items]);

  const toggleItem = (id: string) => {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, done: !item.done } : item)),
    );
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <MaterialIcons name="task-alt" size={24} color={appColors.primary} />
          <Text style={styles.headerTitle}>{shiftDetailsDefaults.checklistTitle}</Text>
        </View>
        <Text style={styles.counter}>
          {doneCount}/{items.length} Done
        </Text>
      </View>

      <Text style={styles.intro}>{shiftDetailsDefaults.checklistIntro}</Text>

      <View style={styles.list}>
        {items.map((item) => (
          <ChecklistTaskRow
            key={item.id}
            title={item.title}
            subtitle={item.subtitle}
            done={item.done}
            highlightSubtitle={item.id === 'nfc-patrol'}
            onToggle={() => toggleItem(item.id)}
          />
        ))}
      </View>
    </View>
  );
}
