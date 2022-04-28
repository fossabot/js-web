import Link from 'next/link';
import { FC } from 'react';
import useTranslation from '../i18n/useTranslation';
import { ChevronLeft } from './icons';

export interface IAdminBack {
  path: string;
}

export const AdminBack: FC<IAdminBack> = (props) => {
  const { path } = props;
  const { t } = useTranslation();

  return (
    <Link href={path}>
      <a className="flex items-center text-caption font-semibold text-gray-650">
        <ChevronLeft className="mr-2 h-4 w-4" />
        <span>{t('back')}</span>
      </a>
    </Link>
  );
};
