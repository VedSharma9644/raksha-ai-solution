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
      title: 'Police Clearance Verification',
      meta: profile?.hasPoliceVerification
        ? 'Document on file'
        : 'Not uploaded yet',
      detail: profile?.hasPoliceVerification
        ? 'Police verification document linked'
        : 'Ask HR to upload police verification',
      status: profile?.hasPoliceVerification ? 'On File' : 'Pending',
      icon: 'verified-user' as const,
      tone: profile?.hasPoliceVerification ? ('success' as const) : ('neutral' as const),
    },
    {
      id: 'character',
      title: 'Character Certificate',
      meta: profile?.hasCharacterCertificate
        ? 'Document on file'
        : 'Not uploaded yet',
      detail: profile?.hasCharacterCertificate
        ? 'Character certificate linked'
        : 'Ask HR to upload character certificate',
      status: profile?.hasCharacterCertificate ? 'On File' : 'Pending',
      icon: 'badge' as const,
      tone: profile?.hasCharacterCertificate ? ('success' as const) : ('neutral' as const),
    },
    {
      id: 'aadhaar',
      title: 'Aadhaar on Record',
      meta: profile?.aadhaarLinked ? 'Aadhaar number saved' : 'Not on file',
      detail: profile?.aadhaarLinked
        ? 'Stored in your employment record'
        : 'Ask HR to update your Aadhaar',
      status: profile?.aadhaarLinked ? 'Linked' : 'Pending',
      icon: 'fingerprint' as const,
      tone: profile?.aadhaarLinked ? ('success' as const) : ('neutral' as const),
    },
  ];

  const verifiedCount = items.filter((item) => item.tone === 'success').length;

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
          {verifiedCount}/{items.length} On File
        </Text>
      </View>

      <View style={styles.stackTight}>
        {items.map((item) => {
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
