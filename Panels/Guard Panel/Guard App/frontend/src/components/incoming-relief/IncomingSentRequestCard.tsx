import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { sentReliefRequest } from '../../constants/incoming-relief-requests-defaults';
import { incomingSentRequestCardStyles as styles } from '../../styles/incoming-sent-request-card.styles';
import { appColors } from '../../theme';

type IncomingSentRequestCardProps = {
  onWithdraw: () => void;
};

export function IncomingSentRequestCard({ onWithdraw }: IncomingSentRequestCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{sentReliefRequest.statusLabel}</Text>
        </View>
        <Text style={styles.sentAgo}>{sentReliefRequest.sentAgo}</Text>
      </View>

      <View>
        <Text style={styles.title}>{sentReliefRequest.title}</Text>
        <Text style={styles.shiftMeta}>{sentReliefRequest.shiftMeta}</Text>
      </View>

      <View style={styles.broadcastBox}>
        <View style={styles.broadcastLeft}>
          <MaterialIcons name="groups" size={22} color={appColors.primary} />
          <Text style={styles.broadcastText}>{sentReliefRequest.broadcastLabel}</Text>
        </View>
        <Text style={styles.activeLabel}>{sentReliefRequest.activeLabel}</Text>
      </View>

      <Pressable
        style={({ pressed }) => [styles.withdrawButton, pressed && styles.pressed]}
        onPress={onWithdraw}
      >
        <MaterialIcons name="delete" size={20} color={appColors.onErrorContainer} />
        <Text style={styles.withdrawLabel}>{sentReliefRequest.withdrawLabel}</Text>
      </Pressable>
    </View>
  );
}
