import { MaterialIcons } from '@expo/vector-icons';
import { Alert, Pressable, Text, View } from 'react-native';

import {
  applyForLeaveDefaults,
  leaveBalanceCards,
} from '../../constants/apply-for-leave-defaults';
import { appColors } from '../../theme';
import { leaveBalanceQuotaCardsStyles as styles } from '../../styles/leave-balance-quota-cards.styles';

function badgeStyles(tone: 'paid' | 'slip' | 'urgent') {
  if (tone === 'paid') {
    return { wrap: styles.badgePaid, text: styles.badgeTextPaid };
  }
  if (tone === 'urgent') {
    return { wrap: styles.badgeUrgent, text: styles.badgeTextUrgent };
  }
  return { wrap: styles.badgeSlip, text: styles.badgeTextSlip };
}

export function LeaveBalanceQuotaCards() {
  return (
    <View style={styles.section}>
      <View style={styles.headingRow}>
        <View style={styles.headingLeft}>
          <MaterialIcons name="account-balance-wallet" size={20} color={appColors.primary} />
          <Text style={styles.heading}>{applyForLeaveDefaults.balancesHeading}</Text>
        </View>
        <Pressable onPress={() => Alert.alert('Quota Rules', 'Leave quota rules will open here soon.')}>
          <Text style={styles.rulesLink}>{applyForLeaveDefaults.quotaRulesLabel}</Text>
        </Pressable>
      </View>

      <View style={styles.grid}>
        {leaveBalanceCards.map((card) => {
          const badge = badgeStyles(card.badgeTone);
          const isInstant = card.key === 'EL';

          return (
            <View key={card.key} style={[styles.card, card.highlighted && styles.cardHighlighted]}>
              <Text style={styles.cardTitle} numberOfLines={1}>
                {card.title}
              </Text>
              <View style={styles.valueRow}>
                {isInstant ? (
                  <>
                    <Text style={styles.valueInstant}>{card.value}</Text>
                    {card.subtitle ? <Text style={styles.subtitle}>{card.subtitle}</Text> : null}
                  </>
                ) : (
                  <Text>
                    <Text style={[styles.value, card.key === 'SL' && styles.valueAlt]}>{card.value}</Text>
                    <Text style={styles.valueSuffix}> {card.valueSuffix}</Text>
                  </Text>
                )}
              </View>
              <View style={[styles.badge, badge.wrap]}>
                <Text style={[styles.badgeText, badge.text]}>{card.badge}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}
