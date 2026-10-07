import { MaterialIcons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import {
  buildProtocolMessage,
  relieveAGuardDefaults,
} from '../../constants/relieve-a-guard-defaults';
import { relieveProtocolNoticeStyles as styles } from '../../styles/relieve-protocol-notice.styles';
import { appColors } from '../../theme';

type RelieveProtocolNoticeProps = {
  selectedGuardName: string;
};

export function RelieveProtocolNotice({ selectedGuardName }: RelieveProtocolNoticeProps) {
  const message = buildProtocolMessage(selectedGuardName);
  const parts = message.split(selectedGuardName);

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <MaterialIcons name="security" size={28} color={appColors.primary} />
        <View style={styles.copy}>
          <Text style={styles.title}>{relieveAGuardDefaults.protocolTitle}</Text>
          <Text style={styles.message}>
            {parts[0]}
            <Text style={styles.guardHighlight}>{selectedGuardName}</Text>
            {parts.slice(1).join(selectedGuardName)}
          </Text>
          <View style={styles.keysRow}>
            <MaterialIcons name="verified" size={16} color={appColors.onSurfaceVariant} />
            <Text style={styles.keysText}>{relieveAGuardDefaults.protocolKeysNote}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
