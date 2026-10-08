import { MaterialIcons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { Pressable, Text, View } from 'react-native';

import { appColors } from '../../theme';
import { homeAssignedSiteInfoStyles as styles } from '../../styles/home-assigned-site-info.styles';

type AssignedSiteInfoCardProps = {
  siteName?: string;
  siteDetail?: string;
  supervisorName?: string;
  supervisorPhone?: string;
  gpsLocked?: boolean;
};

export function AssignedSiteInfoCard({
  siteName = 'Assigned site',
  siteDetail,
  supervisorName,
  supervisorPhone,
  gpsLocked = true,
}: AssignedSiteInfoCardProps) {
  const canCall = Boolean(supervisorPhone?.trim());

  return (
    <View style={styles.siteCard}>
      <View style={styles.siteRow}>
        <MaterialIcons name="location-on" size={22} color={appColors.primary} />
        <View style={styles.siteTextCol}>
          <Text style={styles.siteName}>{siteName}</Text>
          {siteDetail ? <Text style={styles.siteDetail}>{siteDetail}</Text> : null}
        </View>
      </View>

      <View style={styles.chipsRow}>
        {canCall ? (
          <Pressable
            style={({ pressed }) => [styles.callChip, pressed && styles.callChipPressed]}
            onPress={() => Linking.openURL(`tel:${supervisorPhone}`)}
          >
            <MaterialIcons name="call" size={18} color={appColors.primary} />
            <Text style={styles.callText}>
              Supervisor{supervisorName ? `: ${supervisorName}` : ''} (Call)
            </Text>
          </Pressable>
        ) : null}

        {gpsLocked ? (
          <View style={styles.gpsChip}>
            <View style={styles.gpsDot} />
            <Text style={styles.gpsText}>GPS Locked</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}
