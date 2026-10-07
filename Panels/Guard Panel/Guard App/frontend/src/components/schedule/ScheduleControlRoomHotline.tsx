import { MaterialIcons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { Pressable, Text, View } from 'react-native';

import { upcomingScheduleDefaults } from '../../constants/upcoming-schedule-defaults';
import { appColors } from '../../theme';
import { scheduleControlRoomHotlineStyles as styles } from '../../styles/schedule-control-room-hotline.styles';

export function ScheduleControlRoomHotline() {
  return (
    <View style={styles.row}>
      <MaterialIcons name="support-agent" size={18} color={appColors.tertiary} />
      <Text style={styles.label}>{upcomingScheduleDefaults.controlRoomLabel}</Text>
      <Pressable onPress={() => Linking.openURL(`tel:${upcomingScheduleDefaults.controlRoomTel}`)}>
        <Text style={styles.phone}>{upcomingScheduleDefaults.controlRoomPhone}</Text>
      </Pressable>
    </View>
  );
}
