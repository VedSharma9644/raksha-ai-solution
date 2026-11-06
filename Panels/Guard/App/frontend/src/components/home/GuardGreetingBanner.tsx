import { Text, View } from 'react-native';

import { homeGuardGreetingBannerStyles as styles } from '../../styles/home-guard-greeting-banner.styles';
import { GuardUserAvatar } from '../shared/GuardUserAvatar';
import { RaisedCard } from '../shared/RaisedCard';
import { StatusPill } from '../shared/StatusPill';
import { AssignedSiteInfoCard } from './AssignedSiteInfoCard';

type GuardGreetingBannerProps = {
  guardName?: string;
  fullName?: string;
  guardId?: string;
  post?: string;
  photoUri?: string | null;
  siteName?: string;
  siteDetail?: string;
  hrName?: string;
  hrPhone?: string;
};

export function GuardGreetingBanner({
  guardName = 'Guard',
  fullName,
  guardId,
  post,
  photoUri,
  siteName,
  siteDetail,
  hrName,
  hrPhone,
}: GuardGreetingBannerProps) {
  const idLabel = guardId?.trim();
  const postLabel = post?.trim();

  return (
    <RaisedCard>
      <View style={styles.topRow}>
        <View style={styles.greetingCol}>
          <Text style={styles.greeting}>Hello, {guardName}</Text>
          <View style={styles.metaRow}>
            {idLabel ? <StatusPill label={`ID: ${idLabel}`} variant="idBadge" /> : null}
            {idLabel && postLabel ? <Text style={styles.dot}>•</Text> : null}
            {postLabel ? (
              <Text style={styles.post} numberOfLines={1}>
                {postLabel}
              </Text>
            ) : null}
          </View>
        </View>
        <View style={styles.photoWrap}>
          <GuardUserAvatar photoUri={photoUri} fullName={fullName ?? guardName} size={48} />
        </View>
      </View>

      <AssignedSiteInfoCard
        siteName={siteName}
        siteDetail={siteDetail}
        hrName={hrName}
        hrPhone={hrPhone}
      />
    </RaisedCard>
  );
}
