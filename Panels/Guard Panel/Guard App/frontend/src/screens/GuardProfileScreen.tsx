import { StackScrollScreenShell } from '../components/layout/StackScrollScreenShell';
import { GuardProfileScreenContent } from '../components/profile/GuardProfileScreenContent';
import { brandAssets } from '../constants/brand-assets';
import { guardProfileDefaults } from '../constants/guard-profile-defaults';
import { useGuardAppNavigation } from '../navigation/useGuardAppNavigation';

export function GuardProfileScreen() {
  const { goBack } = useGuardAppNavigation();

  return (
    <StackScrollScreenShell
      screenTitle={guardProfileDefaults.screenTitle}
      onBackPress={goBack}
      showNotifications
      profilePhotoUri={brandAssets.scheduleHeaderAvatarUri}
    >
      <GuardProfileScreenContent />
    </StackScrollScreenShell>
  );
}
