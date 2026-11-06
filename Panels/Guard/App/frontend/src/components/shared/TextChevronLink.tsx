import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, Text } from 'react-native';

import { useGuardAppNavigation } from '../../navigation/useGuardAppNavigation';
import { appColors } from '../../theme';
import { sharedTextChevronLinkStyles as styles } from '../../styles/shared-text-chevron-link.styles';

type TextChevronLinkProps = {
  label?: string;
  onPress?: () => void;
};

export function TextChevronLink({ label = 'View Details', onPress }: TextChevronLinkProps) {
  const { openShiftDetails } = useGuardAppNavigation();

  return (
    <Pressable style={styles.button} onPress={onPress ?? openShiftDetails}>
      <Text style={styles.label}>{label}</Text>
      <MaterialIcons name="chevron-right" size={16} color={appColors.primary} />
    </Pressable>
  );
}
