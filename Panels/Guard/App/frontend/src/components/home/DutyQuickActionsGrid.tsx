import { View } from 'react-native';

import { dutyQuickActionItems } from '../../constants/duty-quick-action-items';
import { useGuardAppNavigation } from '../../navigation/useGuardAppNavigation';
import { homeDutyQuickActionsStyles as styles } from '../../styles/home-duty-quick-actions.styles';
import { IconActionTile } from '../shared/IconActionTile';
import { SectionHeading } from '../shared/SectionHeading';

export function DutyQuickActionsGrid() {
  const { setMainTab, openApplyForLeave, openRelieveAGuard } = useGuardAppNavigation();

  const handlePress = (key: string) => {
    if (key === 'leave') {
      openApplyForLeave();
      return;
    }
    if (key === 'relieve') {
      openRelieveAGuard();
      return;
    }
    if (key === 'schedule') {
      setMainTab('schedule');
      return;
    }
    if (key === 'history') {
      setMainTab('attendance');
    }
  };

  return (
    <View style={styles.section}>
      <SectionHeading title="Duty Quick Actions" />
      <View style={styles.grid}>
        {dutyQuickActionItems.map((action) => (
          <IconActionTile
            key={action.key}
            title={action.title}
            subtitle={action.subtitle}
            icon={action.icon}
            onPress={() => handlePress(action.key)}
          />
        ))}
      </View>
    </View>
  );
}
