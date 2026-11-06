import { MaterialIcons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { relieveAGuardDefaults } from '../../constants/relieve-a-guard-defaults';
import { relieveGuardPickerStyles as styles } from '../../styles/relieve-guard-picker.styles';
import { appColors } from '../../theme';

/** Replaces guard picker — Admin/HR assigns the replacement. */
export function RelieveAssignmentInfoCard() {
  return (
    <View style={styles.section}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={styles.stepBadge}>
            <Text style={styles.stepBadgeText}>3</Text>
          </View>
          <Text style={styles.stepTitle}>{relieveAGuardDefaults.step3Title}</Text>
        </View>
      </View>

      <View style={[styles.guardCard, styles.guardCardSelected]}>
        <View style={styles.avatarWrap}>
          <View style={[styles.avatar, styles.avatarSelected]}>
            <MaterialIcons name="admin-panel-settings" size={22} color={appColors.onPrimary} />
          </View>
        </View>
        <View style={styles.guardCopy}>
          <Text style={styles.guardName}>{relieveAGuardDefaults.assignmentInfoTitle}</Text>
          <Text style={styles.guardMeta}>{relieveAGuardDefaults.assignmentInfoMessage}</Text>
        </View>
      </View>
    </View>
  );
}
