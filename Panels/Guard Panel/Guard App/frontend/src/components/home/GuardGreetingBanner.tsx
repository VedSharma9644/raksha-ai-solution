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
  supervisorName?: string;
  supervisorPhone?: string;
};

export function GuardGreetingBanner({
  guardName = 'Guard',
  fullName,
  guardId = '#RK-4092',
  post = 'Gate No. 3',
  photoUri,
  siteName,
  siteDetail,
  supervisorName,
  supervisorPhone,
}: GuardGreetingBannerProps) {
  return (
    <RaisedCard>
      <View style={styles.topRow}>
        <View style={styles.greetingCol}>
          <Text style={styles.greeting}>Good Morning, {guardName}!</Text>
          <View style={styles.metaRow}>
            <StatusPill label={`ID: ${guardId}`} variant="idBadge" />
            <Text style={styles.dot}>•</Text>
            <Text style={styles.post}>{post}</Text>
          </View>
        </View>
        <View style={styles.photoWrap}>
          <GuardUserAvatar photoUri={photoUri} fullName={fullName ?? guardName} size={48} />
        </View>
      </View>

      <AssignedSiteInfoCard
        siteName={siteName}
        siteDetail={siteDetail}
        supervisorName={supervisorName}
        supervisorPhone={supervisorPhone}
      />
    </RaisedCard>
  );
}
