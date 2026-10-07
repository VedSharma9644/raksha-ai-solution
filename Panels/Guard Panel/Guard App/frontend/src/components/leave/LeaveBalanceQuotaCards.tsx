import { MaterialIcons } from '@expo/vector-icons';
import { ActivityIndicator, Alert, Pressable, Text, View } from 'react-native';

import type { LeaveBalanceTypeDto } from '../../api/guard-api';
import { applyForLeaveDefaults, leaveBalanceCards } from '../../constants/apply-for-leave-defaults';
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

type LeaveBalanceQuotaCardsProps = {
  types?: LeaveBalanceTypeDto[];
  loading?: boolean;
};

export function LeaveBalanceQuotaCards({ types, loading }: LeaveBalanceQuotaCardsProps) {
  const cards = types?.length
    ? types.map((type) => ({
        key: type.key,
        title: type.title,
        value: type.valueLabel,
        valueSuffix: type.valueSuffix,
        subtitle: type.subtitle,
        badge: type.badge,
        badgeTone: type.badgeTone,
        highlighted: type.highlighted,
      }))
    : leaveBalanceCards;

  return (
    <View style={styles.section}>
      <View style={styles.headingRow}>
        <View style={styles.headingLeft}>
          <MaterialIcons name="account-balance-wallet" size={20} color={appColors.primary} />
          <Text style={styles.heading}>{applyForLeaveDefaults.balancesHeading}</Text>
        </View>
        <Pressable
          onPress={() =>
            Alert.alert(
              'Quota Rules',
              'Casual Leave (CL): 6 paid days per calendar year.\nSick Leave (SL): 7 days per year (medical slip may be required).\nEmergency Leave (EL): available anytime with supervisor approval.',
            )
          }
        >
          <Text style={styles.rulesLink}>{applyForLeaveDefaults.quotaRulesLabel}</Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={{ paddingVertical: 20, alignItems: 'center' }}>
          <ActivityIndicator color={appColors.primary} />
        </View>
      ) : (
        <View style={styles.grid}>
          {cards.map((card) => {
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
                      <Text style={[styles.value, card.key === 'SL' && styles.valueAlt]}>
                        {card.value}
                      </Text>
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
      )}
    </View>
  );
}
