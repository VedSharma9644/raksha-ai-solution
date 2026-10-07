import { Image, Text, View } from 'react-native';

import { brandAssets } from '../../constants/brand-assets';
import { homeGuardGreetingBannerStyles as styles } from '../../styles/home-guard-greeting-banner.styles';
import { RaisedCard } from '../shared/RaisedCard';
import { StatusPill } from '../shared/StatusPill';
import { AssignedSiteInfoCard } from './AssignedSiteInfoCard';

type GuardGreetingBannerProps = {
  guardName?: string;
  guardId?: string;
  post?: string;
  photoUri?: string;
  siteName?: string;
  siteDetail?: string;
  supervisorName?: string;
  supervisorPhone?: string;
};

export function GuardGreetingBanner({
  guardName = 'Rajesh',
  guardId = '#RK-4092',
  post = 'Gate No. 3',
  photoUri = brandAssets.sampleGuardPhotoUri,
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
          <Image source={{ uri: photoUri }} style={styles.photo} />
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
