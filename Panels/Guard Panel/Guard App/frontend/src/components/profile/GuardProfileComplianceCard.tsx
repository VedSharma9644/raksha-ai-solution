import { MaterialIcons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { guardProfileDefaults } from '../../constants/guard-profile-defaults';
import { useGuardProfile } from '../../hooks/useGuardProfile';
import { guardProfileSectionCardStyles as styles } from '../../styles/guard-profile-section-card.styles';
import { appColors } from '../../theme';

export function GuardProfileComplianceCard() {
  const { profile } = useGuardProfile();

  const items = [
    {
      id: 'police',
      title: 'Police verification',
      status: profile?.hasPoliceVerification ? 'On file' : 'Pending',
      ok: Boolean(profile?.hasPoliceVerification),
      icon: 'verified-user' as const,
    },
    {
      id: 'character',
      title: 'Character certificate',
      status: profile?.hasCharacterCertificate ? 'On file' : 'Pending',
      ok: Boolean(profile?.hasCharacterCertificate),
      icon: 'badge' as const,
    },
    {
      id: 'aadhaar',
      title: 'Aadhaar',
      status: profile?.aadhaarLinked ? 'Linked' : 'Pending',
      ok: Boolean(profile?.aadhaarLinked),
      icon: 'fingerprint' as const,
    },
  ];

  const verifiedCount = items.filter((item) => item.ok).length;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={styles.iconWrap}>
            <MaterialIcons name="badge" size={20} color={appColors.primary} />
          </View>
          <Text style={styles.title}>{guardProfileDefaults.complianceTitle}</Text>
        </View>
        <Text style={styles.headerMeta}>
          {verifiedCount}/{items.length}
        </Text>
      </View>

      <View style={styles.stackTight}>
        {items.map((item) => (
          <View key={item.id} style={styles.listItem}>
            <View style={[styles.listLeft, styles.listLeftCenter]}>
              <View style={item.ok ? styles.statusIconSuccess : styles.statusIconNeutral}>
                <MaterialIcons
                  name={item.icon}
                  size={20}
                  color={item.ok ? '#065f46' : appColors.onSecondaryContainer}
                />
              </View>
              <Text style={styles.listTitle} numberOfLines={1}>
                {item.title}
              </Text>
            </View>
            <View style={item.ok ? styles.statusSuccess : styles.statusNeutral}>
              <Text style={item.ok ? styles.statusSuccessText : styles.statusNeutralText}>
                {item.status}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
