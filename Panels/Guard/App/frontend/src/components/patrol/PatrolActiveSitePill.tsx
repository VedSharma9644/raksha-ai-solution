import { MaterialIcons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { patrolSessionDefaults } from '../../constants/patrol-session-defaults';
import { appColors } from '../../theme';
import { patrolActiveSitePillStyles as styles } from '../../styles/patrol-active-site-pill.styles';

type PatrolActiveSitePillProps = {
  label?: string;
};

export function PatrolActiveSitePill({
  label = patrolSessionDefaults.siteLabel,
}: PatrolActiveSitePillProps) {
  return (
    <View style={styles.pill}>
      <MaterialIcons name="verified" size={16} color={appColors.primaryFixed} />
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}
