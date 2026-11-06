import { ScreenShell } from '../components/layout/ScreenShell';
import { HomeScreenContent } from '../components/home/HomeScreenContent';

export function HomeScreen() {
  return (
    <ScreenShell screenTitle="Home" activeTab="home">
      <HomeScreenContent />
    </ScreenShell>
  );
}
