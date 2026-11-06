import { MaterialIcons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { Pressable, Text, View } from 'react-native';

import { appColors } from '../../theme';
import { homeAssignedSiteInfoStyles as styles } from '../../styles/home-assigned-site-info.styles';

type AssignedSiteInfoCardProps = {
  siteName?: string;
  siteDetail?: string;
  hrName?: string;
  hrPhone?: string;
};

export function AssignedSiteInfoCard({
  siteName,
  siteDetail,
  hrName,
  hrPhone,
}: AssignedSiteInfoCardProps) {
  const site = siteName?.trim();
  const post = siteDetail?.trim();
  const tel = hrPhone?.trim();
  const canCall = Boolean(tel);

  if (!site && !post && !canCall) {
    return null;
  }

  return (
    <View style={styles.siteCard}>
      {site || post ? (
        <View style={styles.siteRow}>
          <MaterialIcons name="location-on" size={22} color={appColors.primary} />
          <View style={styles.siteTextCol}>
            {site ? <Text style={styles.siteName}>{site}</Text> : null}
            {post ? <Text style={styles.siteDetail}>{post}</Text> : null}
          </View>
        </View>
      ) : null}

      {canCall ? (
        <View style={styles.chipsRow}>
          <Pressable
            style={({ pressed }) => [styles.callChip, pressed && styles.callChipPressed]}
            onPress={() => Linking.openURL(`tel:${tel}`)}
          >
            <MaterialIcons name="call" size={18} color={appColors.primary} />
            <Text style={styles.callText}>
              Call {hrName?.trim() || 'Site HR'}
            </Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}
