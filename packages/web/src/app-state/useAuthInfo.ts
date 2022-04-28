import { useContext } from 'react';
import { PolicyEnum, GOD_MODE } from '../constants/policies';
import { AuthContext, IAuthContext } from './authContext';

interface IAuthInfo {
  context: IAuthContext;
  canAccess: (...policyNames: PolicyEnum[]) => boolean;
  isLoading: boolean;
}

export function useAuthInfo(): IAuthInfo {
  const context = useContext(AuthContext);

  function canAccess(...policyNames: PolicyEnum[]): boolean {
    const policies = context?.policies;

    if (!policies) return false;

    if (policies.includes(GOD_MODE.GRANT_ALL_ACCESS)) {
      return true;
    }

    return policyNames.some((policyName) => policies.includes(policyName));
  }

  return { canAccess, context, isLoading: context && context.isLoading };
}
