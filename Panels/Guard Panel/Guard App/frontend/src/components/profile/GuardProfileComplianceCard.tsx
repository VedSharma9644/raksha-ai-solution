import { MaterialIcons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import {
  guardProfileDefaults,
  profileComplianceItems,
} from '../../constants/guard-profile-defaults';
import { guardProfileSectionCardStyles as styles } from '../../styles/guard-profile-section-card.styles';
import { appColors } from '../../theme';

export function GuardProfileComplianceCard() {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={styles.iconWrap}>
            <MaterialIcons name="badge" size={20} color={appColors.primary} />
          </View>
          <Text style={styles.title}>{guardProfileDefaults.complianceTitle}</Text>
        </View>
        <Text style={styles.headerMeta}>{guardProfileDefaults.complianceCount}</Text>
      </View>

      <View style={styles.stackTight}>
        {profileComplianceItems.map((item) => {
          const success = item.tone === 'success';
          return (
            <View key={item.id} style={styles.listItem}>
              <View style={styles.listLeft}>
                <View style={success ? styles.statusIconSuccess : styles.statusIconNeutral}>
                  <MaterialIcons
                    name={item.icon}
                    size={20}
                    color={success ? '#065f46' : appColors.onSecondaryContainer}
                  />
                </View>
                <View style={styles.listCopy}>
                  <Text style={styles.listTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.listMeta}>{item.meta}</Text>
                  <Text style={styles.listDetail}>{item.detail}</Text>
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
