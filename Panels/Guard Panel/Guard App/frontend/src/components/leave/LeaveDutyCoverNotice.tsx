import { MaterialIcons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { applyForLeaveDefaults } from '../../constants/apply-for-leave-defaults';
import { appColors } from '../../theme';
import { leaveDutyCoverNoticeStyles as styles } from '../../styles/leave-duty-cover-notice.styles';

export function LeaveDutyCoverNotice() {
  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        <MaterialIcons name="swap-horiz" size={22} color={appColors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{applyForLeaveDefaults.coverTitle}</Text>
        <Text style={styles.message}>
          {applyForLeaveDefaults.coverMessagePrefix}{' '}
          <Text style={styles.emphasis}>{applyForLeaveDefaults.coverSite}</Text>{' '}
          {applyForLeaveDefaults.coverMessageMid}{' '}
          <Text style={styles.emphasis}>{applyForLeaveDefaults.coverSupervisor}</Text>.
        </Text>
      </View>
    </View>
  );
}
