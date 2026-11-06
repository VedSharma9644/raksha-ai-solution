import { useContext } from 'react';

import { GuardAppNavigationContext } from './GuardAppNavigationProvider';

export function useGuardAppNavigation() {
  const context = useContext(GuardAppNavigationContext);
  if (!context) {
    throw new Error('useGuardAppNavigation must be used within GuardAppNavigationProvider');
  }
  return context;
}
