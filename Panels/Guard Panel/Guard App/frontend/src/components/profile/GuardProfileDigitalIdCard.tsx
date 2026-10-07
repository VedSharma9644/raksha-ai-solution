import { MaterialIcons } from '@expo/vector-icons';
import { Image, Pressable, Text, View } from 'react-native';

import { guardProfileDefaults } from '../../constants/guard-profile-defaults';
import { guardProfileDigitalIdCardStyles as styles } from '../../styles/guard-profile-digital-id-card.styles';
import { appColors } from '../../theme';
import { GuardProfileAuditQr } from './GuardProfileAuditQr';

type GuardProfileDigitalIdCardProps = {
  onOpenQr: () => void;
  onDownload: () => void;
};

export function GuardProfileDigitalIdCard({ onOpenQr, onDownload }: GuardProfileDigitalIdCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          <MaterialIcons name="verified" size={18} color={appColors.primaryFixed} />
          <Text style={styles.topBarLabel} numberOfLines={1}>
            {guardProfileDefaults.verifiedBarLabel}
          </Text>
        </View>
        <View style={styles.activeChip}>
          <View style={styles.activeDot} />
          <Text style={styles.activeText}>{guardProfileDefaults.activeDutyLabel}</Text>
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.headerRow}>
          <View style={styles.headerCopy}>
            <Text style={styles.eyebrow}>{guardProfileDefaults.credentialEyebrow}</Text>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {guardProfileDefaults.idCardTitle}
            </Text>
          </View>
          <View style={styles.idBadge}>
            <Text style={styles.idLabel}>{guardProfileDefaults.guardIdLabel}</Text>
            <Text style={styles.idValue}>{guardProfileDefaults.guardId}</Text>
          </View>
        </View>

        <View style={styles.identityRow}>
          <View style={styles.photoWrap}>
            <Image source={{ uri: guardProfileDefaults.photoUri }} style={styles.photo} />
            <View style={styles.gradeBar}>
              <Text style={styles.gradeText}>{guardProfileDefaults.gradeLabel}</Text>
            </View>
          </View>
          <View style={styles.identityCopy}>
            <Text style={styles.name} numberOfLines={1}>
              {guardProfileDefaults.guardName}
            </Text>
            <Text style={styles.role} numberOfLines={1}>
              {guardProfileDefaults.guardRole}
            </Text>
            <View style={styles.chipsRow}>
              <View style={styles.chip}>
                <MaterialIcons name="bloodtype" size={15} color={appColors.error} />
                <Text style={styles.chipText}>{guardProfileDefaults.bloodType}</Text>
              </View>
              <View style={styles.chip}>
                <MaterialIcons name="local-police" size={15} color={appColors.primary} />
                <Text style={styles.chipText}>{guardProfileDefaults.verifiedChip}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.qrBlock}>
          <View style={styles.qrCopy}>
            <View style={styles.qrTitleRow}>
              <MaterialIcons name="qr-code-scanner" size={18} color={appColors.primary} />
              <Text style={styles.qrTitle}>{guardProfileDefaults.qrTitle}</Text>
            </View>
            <Text style={styles.qrHint}>{guardProfileDefaults.qrHint}</Text>
            <View style={styles.validRow}>
              <MaterialIcons name="event-available" size={14} color={appColors.secondary} />
              <Text style={styles.validText}>{guardProfileDefaults.qrValidTill}</Text>
            </View>
          </View>
          <Pressable
            accessibilityLabel="Open Fullscreen QR"
            style={({ pressed }) => [styles.qrTap, pressed && styles.qrTapPressed]}
            onPress={onOpenQr}
          >
            <GuardProfileAuditQr size={64} />
            <Text style={styles.qrTapLabel}>{guardProfileDefaults.qrTapLabel}</Text>
          </Pressable>
        </View>

        <View style={styles.actionsRow}>
          <Pressable
            style={({ pressed }) => [styles.secondaryAction, pressed && styles.actionPressed]}
            onPress={onDownload}
          >
            <MaterialIcons name="download" size={20} color={appColors.primary} />
            <Text style={styles.actionLabel} numberOfLines={1}>
              {guardProfileDefaults.downloadPdfLabel}
            </Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.primaryAction, pressed && styles.actionPressed]}
            onPress={onOpenQr}
          >
            <MaterialIcons name="fullscreen" size={20} color={appColors.onPrimary} />
            <Text style={styles.primaryActionLabel} numberOfLines={1}>
              {guardProfileDefaults.fullBadgeLabel}
            </Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.footerBar}>
        <Text style={styles.footerText}>{guardProfileDefaults.certifiedFooter}</Text>
        <Text style={styles.footerHash}>{guardProfileDefaults.hashFooter}</Text>
      </View>
    </View>
  );
}
