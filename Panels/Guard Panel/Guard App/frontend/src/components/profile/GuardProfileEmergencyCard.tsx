import { MaterialIcons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { Pressable, Text, View } from 'react-native';

import { guardProfileDefaults } from '../../constants/guard-profile-defaults';
import { guardProfileSectionCardStyles as styles } from '../../styles/guard-profile-section-card.styles';
import { appColors } from '../../theme';

export function GuardProfileEmergencyCard() {
  return (
    <View style={styles.card}>
      <View style={styles.headerLeft}>
        <View style={[styles.iconWrap, styles.iconWrapError]}>
          <MaterialIcons name="medical-services" size={20} color={appColors.error} />
        </View>
        <Text style={styles.title}>{guardProfileDefaults.emergencyTitle}</Text>
      </View>

      <View style={styles.stack}>
        <View style={styles.infoRow}>
          <View style={styles.infoCopy}>
            <Text style={styles.fieldLabel}>{guardProfileDefaults.kinLabel}</Text>
            <Text style={styles.fieldValueLg} numberOfLines={1}>
              {guardProfileDefaults.kinName}
            </Text>
            <Text style={styles.fieldMeta14}>{guardProfileDefaults.kinPhone}</Text>
          </View>
          <Pressable
            accessibilityLabel="Call emergency contact"
            style={({ pressed }) => [styles.emergencyCall, pressed && styles.pressed]}
            onPress={() => Linking.openURL(`tel:${guardProfileDefaults.kinTel}`)}
          >
            <MaterialIcons name="emergency" size={22} color={appColors.onErrorContainer} />
          </Pressable>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoCopy}>
            <Text style={styles.fieldLabel}>{guardProfileDefaults.esicLabel}</Text>
            <Text style={styles.fieldValue}>{guardProfileDefaults.esicNumber}</Text>
            <Text style={styles.fieldMeta}>{guardProfileDefaults.esicCover}</Text>
          </View>
          <MaterialIcons name="health-and-safety" size={28} color={appColors.primary} />
        </View>
      </View>
    </View>
  );
}
