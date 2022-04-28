import Error from 'next/error';
import { FunctionComponent, ReactElement } from 'react';

import { useAuthInfo } from './useAuthInfo';
import { PolicyEnum } from '../constants/policies';

type PolicyAccessProps = {
  policyNames: PolicyEnum[];
};

export const AccessControl: FunctionComponent<PolicyAccessProps> = ({
  policyNames,
  children,
}): ReactElement => {
  const { canAccess, isLoading } = useAuthInfo();

  if (isLoading) {
    return null;
  }

  if (policyNames.every((name) => !canAccess(name))) {
    return <Error statusCode={404} />;
  }

  return <>{children}</>;
};
