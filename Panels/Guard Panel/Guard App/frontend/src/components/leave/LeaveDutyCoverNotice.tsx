import { MaterialIcons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { applyForLeaveDefaults } from '../../constants/apply-for-leave-defaults';
import { appColors } from '../../theme';
import { leaveDutyCoverNoticeStyles as styles } from '../../styles/leave-duty-cover-notice.styles';

type LeaveDutyCoverNoticeProps = {
  siteName?: string;
  supervisorName?: string;
};

export function LeaveDutyCoverNotice({
  siteName,
  supervisorName,
}: LeaveDutyCoverNoticeProps) {
  const site = siteName?.trim() || applyForLeaveDefaults.coverSite;
  const supervisor = supervisorName?.trim() || applyForLeaveDefaults.coverSupervisor;

  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        <MaterialIcons name="swap-horiz" size={22} color={appColors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{applyForLeaveDefaults.coverTitle}</Text>
        <Text style={styles.message}>
          {applyForLeaveDefaults.coverMessagePrefix}{' '}
          <Text style={styles.emphasis}>{site}</Text>{' '}
          {applyForLeaveDefaults.coverMessageMid}{' '}
          <Text style={styles.emphasis}>{supervisor}</Text>.
        </Text>
      </View>
    </View>
  );
}
