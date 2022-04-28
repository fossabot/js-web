import Link from 'next/link';
import WEB_PATHS from '../constants/webPaths';
import Picture from '../ui-kit/Picture';
import { FiArrowLeft } from 'react-icons/fi';
import useTranslation from '../i18n/useTranslation';

interface IErrorMessageProps {
  title: string;
  description?: string;
}

export default function ErrorMessage({
  title,
  description,
}: IErrorMessageProps) {
  const { t } = useTranslation();

  return (
    <>
      <div className="max-w-80 text-center">
        <Picture
          sources={[{ srcSet: '/assets/error.webp', type: 'image/webp' }]}
          fallbackImage={{ src: '/assets/error.png' }}
          className="mx-auto mb-8"
        />
        <div className="mb-4 text-title-desktop font-bold">{title}</div>
        {description && (
          <div className="mb-8 text-center text-caption text-gray-500">
            {description}
          </div>
        )}
        <div className="flex items-center justify-center text-caption font-semibold text-brand-primary">
          <FiArrowLeft className="mr-2 h-5 w-5" />
          <Link href={WEB_PATHS.DASHBOARD}>{t('backToDashboard')}</Link>
        </div>
      </div>
    </>
  );
}
