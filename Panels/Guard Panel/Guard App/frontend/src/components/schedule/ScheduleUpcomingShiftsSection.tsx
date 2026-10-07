import { MaterialIcons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { upcomingShiftItems } from '../../constants/upcoming-schedule-defaults';
import { appColors, appSpacing } from '../../theme';
import { scheduleUpcomingListHeaderStyles as headerStyles } from '../../styles/schedule-upcoming-list-header.styles';
import { ScheduleUpcomingShiftCard } from './ScheduleUpcomingShiftCard';

export function ScheduleUpcomingShiftsSection() {
  return (
    <View style={{ gap: appSpacing.sm }}>
      <View style={headerStyles.row}>
        <View style={headerStyles.left}>
          <MaterialIcons name="calendar-month" size={22} color={appColors.primary} />
          <Text style={headerStyles.title}>Upcoming Shifts</Text>
        </View>
        <Text style={headerStyles.subtitle}>Sorted by Day</Text>
      </View>

      {upcomingShiftItems.map((shift) => (
        <ScheduleUpcomingShiftCard key={shift.id} shift={shift} />
      ))}
    </View>
  );
}
