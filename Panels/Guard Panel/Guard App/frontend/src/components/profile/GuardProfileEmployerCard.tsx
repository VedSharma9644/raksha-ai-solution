import { MaterialIcons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { Pressable, Text, View } from 'react-native';

import { guardProfileDefaults } from '../../constants/guard-profile-defaults';
import { guardProfileSectionCardStyles as styles } from '../../styles/guard-profile-section-card.styles';
import { appColors } from '../../theme';

export function GuardProfileEmployerCard() {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={styles.iconWrap}>
            <MaterialIcons name="apartment" size={20} color={appColors.primary} />
          </View>
          <Text style={styles.title}>{guardProfileDefaults.employerTitle}</Text>
        </View>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>{guardProfileDefaults.activeDutyLabel}</Text>
        </View>
      </View>

      <View style={styles.stack}>
        <View style={styles.infoBlock}>
          <Text style={styles.fieldLabel}>{guardProfileDefaults.agencyLabel}</Text>
          <Text style={styles.fieldValue}>{guardProfileDefaults.agencyName}</Text>
          <Text style={styles.fieldMeta}>
            PSARA License:{' '}
            <Text style={styles.mono}>#DL-PSARA-2019-8812</Text>
          </Text>
        </View>

        <View style={[styles.infoRow, styles.infoRowStart]}>
          <View style={styles.infoIcon}>
            <MaterialIcons name="location-on" size={22} color={appColors.primary} />
          </View>
          <View style={styles.infoCopy}>
            <Text style={styles.fieldLabel}>{guardProfileDefaults.siteLabel}</Text>
            <Text style={styles.fieldValueLg}>{guardProfileDefaults.siteName}</Text>
            <Text style={styles.fieldMeta14}>{guardProfileDefaults.sitePost}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoIcon}>
            <MaterialIcons name="schedule" size={22} color={appColors.primary} />
          </View>
          <View style={styles.infoCopy}>
            <Text style={styles.fieldLabel}>{guardProfileDefaults.shiftLabel}</Text>
            <Text style={styles.fieldValueLg} numberOfLines={1}>
              {guardProfileDefaults.shiftTime}
            </Text>
          </View>
          <View style={styles.rosterChip}>
            <Text style={styles.rosterChipText}>{guardProfileDefaults.shiftRoster}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoIconCircle}>
            <MaterialIcons name="supervisor-account" size={22} color={appColors.onSecondaryContainer} />
          </View>
          <View style={styles.infoCopy}>
            <Text style={styles.fieldLabel}>{guardProfileDefaults.supervisorLabel}</Text>
            <Text style={styles.fieldValueLg} numberOfLines={1}>
              {guardProfileDefaults.supervisorName}
            </Text>
            <Text style={styles.fieldMeta}>{guardProfileDefaults.supervisorMeta}</Text>
          </View>
          <Pressable
            accessibilityLabel="Call Supervisor Amit Singh"
            style={({ pressed }) => [styles.callButton, pressed && styles.pressed]}
            onPress={() => Linking.openURL(`tel:${guardProfileDefaults.supervisorTel}`)}
          >
            <MaterialIcons name="call" size={22} color={appColors.onPrimary} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}
