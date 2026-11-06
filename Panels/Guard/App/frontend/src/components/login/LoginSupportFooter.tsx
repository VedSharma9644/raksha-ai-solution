import { MaterialIcons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { loginScreenDefaults } from '../../constants/login-screen-defaults';
import { loginSupportFooterStyles as styles } from '../../styles/login-support-footer.styles';
import { appColors } from '../../theme';

export function LoginSupportFooter() {
  return (
    <View style={styles.footer}>
      <View style={styles.complianceRow}>
        <MaterialIcons name="verified" size={15} color={appColors.primary} />
        <Text style={styles.complianceText}>{loginScreenDefaults.complianceLabel}</Text>
      </View>
    </View>
  );
}
