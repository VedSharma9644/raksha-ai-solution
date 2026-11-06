import { MaterialIcons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { patrolSessionDefaults } from '../../constants/patrol-session-defaults';
import { appColors } from '../../theme';
import { patrolCaptureSuccessToastStyles as styles } from '../../styles/patrol-capture-success-toast.styles';

type PatrolCaptureSuccessToastProps = {
  visible: boolean;
  title?: string;
  subtitle?: string;
};

export function PatrolCaptureSuccessToast({
  visible,
  title = patrolSessionDefaults.captureSuccessTitle,
  subtitle = patrolSessionDefaults.captureSuccessSubtitle,
}: PatrolCaptureSuccessToastProps) {
  if (!visible) {
    return null;
  }

  return (
    <View style={styles.toast}>
      <MaterialIcons name="task-alt" size={28} color={appColors.primaryFixed} />
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle} numberOfLines={2}>
          {subtitle}
        </Text>
      </View>
    </View>
  );
}
