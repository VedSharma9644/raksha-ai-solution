import { MaterialIcons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { Image, Pressable, Text, View } from 'react-native';

import { urgentCoverRequest } from '../../constants/incoming-relief-requests-defaults';
import { incomingUrgentCoverCardStyles as styles } from '../../styles/incoming-urgent-cover-card.styles';
import { appColors } from '../../theme';

type IncomingUrgentCoverCardProps = {
  dismissed?: boolean;
  onAccept: () => void;
  onDecline: () => void;
};

export function IncomingUrgentCoverCard({
  dismissed = false,
  onAccept,
  onDecline,
}: IncomingUrgentCoverCardProps) {
  if (dismissed) {
    return null;
  }

  return (
    <View style={styles.card}>
      <View style={styles.spine} />
      <View style={styles.body}>
        <View style={styles.headerRow}>
          <View style={styles.urgencyBadge}>
            <MaterialIcons name="report" size={18} color={appColors.onErrorContainer} />
            <Text style={styles.urgencyText}>{urgentCoverRequest.urgencyLabel}</Text>
          </View>
          <View style={styles.expiresRow}>
            <MaterialIcons name="hourglass-top" size={16} color={appColors.tertiary} />
            <Text style={styles.expiresText}>{urgentCoverRequest.expiresLabel}</Text>
          </View>
        </View>

        <View style={styles.profileRow}>
          <View style={styles.profileLeft}>
            <Image source={{ uri: urgentCoverRequest.photoUri }} style={styles.photo} />
            <View style={styles.profileCopy}>
              <Text style={styles.name} numberOfLines={1}>
                {urgentCoverRequest.guardName}
              </Text>
              <Text style={styles.meta} numberOfLines={1}>
                {urgentCoverRequest.guardMeta}
              </Text>
            </View>
          </View>
          <Pressable
            accessibilityLabel={`Call ${urgentCoverRequest.guardName}`}
            style={({ pressed }) => [styles.callButton, pressed && styles.pressed]}
            onPress={() => Linking.openURL(`tel:${urgentCoverRequest.tel}`)}
          >
            <MaterialIcons name="call" size={22} color={appColors.primary} />
          </Pressable>
        </View>

        <View style={styles.shiftBox}>
          <View style={styles.shiftRow}>
            <MaterialIcons name="location-on" size={20} color={appColors.primary} />
            <View style={styles.shiftCopy}>
              <Text style={styles.shiftTitle}>{urgentCoverRequest.siteName}</Text>
              <Text style={styles.shiftSub} numberOfLines={1}>
                {urgentCoverRequest.postLabel}
              </Text>
            </View>
          </View>
          <View style={styles.shiftRow}>
            <MaterialIcons name="schedule" size={20} color={appColors.primary} />
            <View style={styles.shiftCopy}>
              <Text style={styles.shiftTitle}>{urgentCoverRequest.shiftDate}</Text>
              <Text style={styles.shiftSub}>{urgentCoverRequest.shiftTime}</Text>
            </View>
          </View>
          <View style={styles.overtimeRow}>
            <MaterialIcons name="savings" size={20} color={appColors.primaryContainer} />
            <Text style={styles.overtimeText}>{urgentCoverRequest.overtimeLabel}</Text>
          </View>
        </View>

        <View style={styles.reasonBox}>
          <MaterialIcons name="medical-services" size={20} color={appColors.onSurfaceVariant} />
          <Text style={styles.reasonText}>
            <Text style={styles.reasonBold}>Reason: </Text>
            {`"${urgentCoverRequest.reason}"`}
          </Text>
        </View>

        <View style={styles.actions}>
          <Pressable
            style={({ pressed }) => [styles.acceptButton, pressed && styles.pressed]}
            onPress={onAccept}
          >
            <MaterialIcons name="check-circle" size={24} color={appColors.onPrimary} />
            <Text style={styles.acceptLabel}>Accept Duty & Cover Shift</Text>
          </Pressable>
          <View style={styles.secondaryRow}>
            <Pressable
              style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
              onPress={onDecline}
            >
              <MaterialIcons name="close" size={20} color={appColors.onSurface} />
              <Text style={styles.secondaryLabel}>Decline Cover</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
              onPress={() => Linking.openURL(`tel:${urgentCoverRequest.tel}`)}
            >
              <MaterialIcons name="chat" size={20} color={appColors.primary} />
              <Text style={styles.callLabel}>Quick Call</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}
