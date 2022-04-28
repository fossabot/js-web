import React from 'react';
import Link from 'next/link';
import HeaderContainer from './HeaderContainer';
import WEB_PATHS from '../../constants/webPaths';
import useTranslation from '../../i18n/useTranslation';

interface IInfoHeaderProps {
  className?: string;
}

const InfoHeader = ({ className }: IInfoHeaderProps) => {
  const { t } = useTranslation();
  return (
    <HeaderContainer className={className}>
      <div className="text-caption">
        <span className="mr-2">{t('navbar.needHelp')}</span>
        <Link href={WEB_PATHS.HELP_CENTER}>
          <a
            className="font-semibold text-brand-primary"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('navbar.helpCenter')}
          </a>
        </Link>
      </div>
    </HeaderContainer>
  );
};

export default InfoHeader;
