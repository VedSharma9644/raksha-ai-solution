import { MaterialIcons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import {
  guardProfileDefaults,
  profileDutyGearItems,
} from '../../constants/guard-profile-defaults';
import { guardProfileSectionCardStyles as styles } from '../../styles/guard-profile-section-card.styles';
import { appColors } from '../../theme';

export function GuardProfileDutyGearCard() {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={styles.iconWrap}>
            <MaterialIcons name="security" size={20} color={appColors.primary} />
          </View>
          <Text style={styles.title}>{guardProfileDefaults.gearTitle}</Text>
        </View>
        <Text style={styles.headerMetaMuted}>{guardProfileDefaults.gearCount}</Text>
      </View>

      <View style={styles.stackTight}>
        {profileDutyGearItems.map((item) => {
          const success = item.tone === 'success';
          return (
            <View key={item.id} style={styles.listItem}>
              <View style={[styles.listLeft, styles.listLeftCenter]}>
                <MaterialIcons name={item.icon} size={24} color={appColors.primary} />
                <View style={styles.listCopy}>
                  <Text style={styles.listTitle}>{item.title}</Text>
                  <Text style={styles.listMeta}>{item.meta}</Text>
                </View>
              </View>
              <View style={success ? styles.statusSuccess : styles.statusNeutral}>
                <Text style={success ? styles.statusSuccessText : styles.statusNeutralText}>
                  {item.status}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}
