import { MaterialIcons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { Image, Pressable, Text, View } from 'react-native';

import { swapProposalRequest } from '../../constants/incoming-relief-requests-defaults';
import { incomingSwapProposalCardStyles as styles } from '../../styles/incoming-swap-proposal-card.styles';
import { appColors } from '../../theme';

type IncomingSwapProposalCardProps = {
  dismissed?: boolean;
  onAccept: () => void;
  onReject: () => void;
};

export function IncomingSwapProposalCard({
  dismissed = false,
  onAccept,
  onReject,
}: IncomingSwapProposalCardProps) {
  if (dismissed) {
    return null;
  }

  return (
    <View style={styles.card}>
      <View style={styles.spine} />
      <View style={styles.body}>
        <View style={styles.headerRow}>
          <View style={styles.tagBadge}>
            <MaterialIcons name="swap-horiz" size={18} color={appColors.onPrimaryFixed} />
            <Text style={styles.tagText}>{swapProposalRequest.tagLabel}</Text>
          </View>
          <Text style={styles.statusText}>{swapProposalRequest.statusLabel}</Text>
        </View>

        <View style={styles.profileRow}>
          <View style={styles.profileLeft}>
            <Image source={{ uri: swapProposalRequest.photoUri }} style={styles.photo} />
            <View style={styles.profileCopy}>
              <Text style={styles.name} numberOfLines={1}>
                {swapProposalRequest.guardName}
              </Text>
              <Text style={styles.meta} numberOfLines={1}>
                {swapProposalRequest.guardMeta}
              </Text>
            </View>
          </View>
          <Pressable
            accessibilityLabel={`Call ${swapProposalRequest.guardName}`}
            style={({ pressed }) => [styles.callButton, pressed && styles.pressed]}
            onPress={() => Linking.openURL(`tel:${swapProposalRequest.tel}`)}
          >
            <MaterialIcons name="call" size={22} color={appColors.primary} />
          </Pressable>
        </View>

        <View style={styles.exchangeList}>
          <View style={[styles.exchangeBox, styles.wantsBox]}>
            <View style={[styles.exchangeIcon, styles.wantsIcon]}>
              <MaterialIcons name="north-east" size={18} color={appColors.onTertiaryFixed} />
            </View>
            <View style={styles.exchangeCopy}>
              <Text style={styles.exchangeLabel}>{swapProposalRequest.wantsLabel}</Text>
              <Text style={styles.exchangeShift} numberOfLines={1}>
                {swapProposalRequest.wantsShift}
              </Text>
              <Text style={styles.exchangePost}>{swapProposalRequest.wantsPost}</Text>
            </View>
          </View>

          <View style={[styles.exchangeBox, styles.givesBox]}>
            <View style={[styles.exchangeIcon, styles.givesIcon]}>
              <MaterialIcons name="call-received" size={18} color={appColors.onPrimaryFixed} />
            </View>
            <View style={styles.exchangeCopy}>
              <Text style={[styles.exchangeLabel, styles.givesLabel]}>
                {swapProposalRequest.givesLabel}
              </Text>
              <Text style={styles.exchangeShift} numberOfLines={1}>
                {swapProposalRequest.givesShift}
              </Text>
              <Text style={styles.exchangePost}>{swapProposalRequest.givesPost}</Text>
            </View>
          </View>
        </View>

        <View style={styles.noteBox}>
          <MaterialIcons name="info" size={20} color={appColors.onSurfaceVariant} />
          <Text style={styles.noteText}>
            <Text style={styles.noteBold}>Colleague Note: </Text>
            {`"${swapProposalRequest.note}"`}
          </Text>
        </View>

        <View style={styles.actionsRow}>
          <Pressable
            style={({ pressed }) => [styles.acceptButton, pressed && styles.pressed]}
            onPress={onAccept}
          >
            <MaterialIcons name="swap-calls" size={22} color={appColors.onPrimary} />
            <Text style={styles.acceptLabel}>Agree & Swap</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.rejectButton, pressed && styles.pressed]}
            onPress={onReject}
          >
            <MaterialIcons name="cancel" size={22} color={appColors.onSurface} />
            <Text style={styles.rejectLabel}>Reject Swap</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
