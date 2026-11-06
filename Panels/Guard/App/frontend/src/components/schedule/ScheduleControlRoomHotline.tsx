import { MaterialIcons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { Pressable, Text, View } from 'react-native';

import {
  formatPhoneDisplay,
  toTelHref,
  useGuardProfile,
} from '../../hooks/useGuardProfile';
import { appColors } from '../../theme';
import { scheduleControlRoomHotlineStyles as styles } from '../../styles/schedule-control-room-hotline.styles';

/** Shows Site HR phone when available — no fake toll-free numbers. */
export function ScheduleControlRoomHotline() {
  const { profile } = useGuardProfile();
  const hrName = profile?.site.hrName?.trim() || 'Site HR';
  const hrContact = profile?.site.hrContact?.trim() || '';
  const hrTel = toTelHref(hrContact);

  if (!hrTel) {
    return null;
  }

  return (
    <View style={styles.row}>
      <MaterialIcons name="support-agent" size={18} color={appColors.tertiary} />
      <Text style={styles.label}>{hrName}</Text>
      <Pressable onPress={() => Linking.openURL(`tel:${hrTel}`)}>
        <Text style={styles.phone}>{formatPhoneDisplay(hrContact)}</Text>
      </Pressable>
    </View>
  );
}
