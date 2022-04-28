import { FC } from 'react';

import cx from 'classnames';

interface ICertificateProviderButton {
  isActive: boolean;
  onClick: () => void;
}

export const CertificateProviderButton: FC<ICertificateProviderButton> = ({
  isActive,
  children,
  onClick,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        'rounded-lg border p-4 text-left text-caption font-semibold',
        {
          'border-transparent text-gray-650': !isActive,
          'border-brand-primary bg-white text-brand-primary': isActive,
        },
      )}
    >
      {children}
    </button>
  );
};
