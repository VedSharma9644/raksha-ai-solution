import { ScreenShell } from '../components/layout/ScreenShell';
import { SalaryPayrollScreenContent } from '../components/salary/SalaryPayrollScreenContent';
import { salaryPayrollDefaults } from '../constants/salary-payroll-defaults';
import { useGuardAppNavigation } from '../navigation/useGuardAppNavigation';

export function SalaryTabScreen() {
  const { guardUser } = useGuardAppNavigation();

  return (
    <ScreenShell
      screenTitle={salaryPayrollDefaults.screenTitle}
      activeTab="more"
      profilePhotoUri={guardUser?.profilePictureUrl}
    >
      <SalaryPayrollScreenContent />
    </ScreenShell>
  );
}
