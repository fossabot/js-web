import { FC } from 'react';
import WEB_PATHS from '../../constants/webPaths';
import useTranslation from '../../i18n/useTranslation';
import {
  CertificateColor,
  GridSquare,
  ProgressCircle,
  UPoint,
} from '../../ui-kit/icons';
import Link from 'next/link';

export interface IStat {
  name: string;
  upoint: number;
  nTotalCourses: number;
  nInProgress: number;
  nCompleted: number;
  nCertificate: number;
}

export const Stat: FC<IStat> = (props) => {
  const { name, upoint, nTotalCourses, nInProgress, nCompleted, nCertificate } =
    props;
  const { t } = useTranslation();

  return (
    <section className="p-4 lg:w-4/12 lg:rounded-3xl lg:border lg:border-gray-200">
      <span className="text-subheading font-bold lg:text-heading">
        {t('dashboardHomePage.welcomeBack')}, {name}
      </span>
      <div className="mt-2 flex items-center space-x-2">
        <UPoint className="text-gray-650" />
        <span className="text-gray-650">
          {upoint} {t('dashboardHomePage.points')}
        </span>
      </div>
      <div className="mt-4 border-b border-gray-200" />
      <div className="mt-2">
        <Link href={WEB_PATHS.DASHBOARD_COURSES + '?status=notStarted'}>
          <a>
            <div className="flex justify-between p-4 lg:rounded-lg lg:hover:bg-gray-200">
              <div className="flex items-center space-x-2">
                <GridSquare className="h-6 w-6" />
                <span className="text-caption font-semibold text-gray-650">
                  {t('dashboardHomePage.totalCourses')}
                </span>
              </div>
              <div className="text-heading font-semibold">{nTotalCourses}</div>
            </div>
          </a>
        </Link>
        <Link href={WEB_PATHS.DASHBOARD_COURSES + '?status=inProgress'}>
          <a>
            <div className="flex justify-between p-4 lg:rounded-lg lg:hover:bg-gray-200">
              <div className="flex items-center space-x-2">
                <ProgressCircle percentage={20} className="h-6 w-6" />
                <span className="text-caption font-semibold text-gray-650">
                  {t('dashboardHomePage.inProgress')}
                </span>
              </div>
              <div className="text-heading font-semibold">{nInProgress}</div>
            </div>
          </a>
        </Link>
        <Link href={WEB_PATHS.DASHBOARD_COURSES + '?status=completed'}>
          <a>
            <div className="flex justify-between p-4 lg:rounded-lg lg:hover:bg-gray-200">
              <div className="flex items-center space-x-2">
                <ProgressCircle percentage={100} className="h-6 w-6" />
                <span className="text-caption font-semibold text-gray-650">
                  {t('dashboardHomePage.complete')}
                </span>
              </div>
              <div className="text-heading font-semibold">{nCompleted}</div>
            </div>
          </a>
        </Link>
        <Link href={WEB_PATHS.DASHBOARD_CERTIFICATE}>
          <a>
            <div className="flex justify-between p-4 lg:rounded-lg lg:hover:bg-gray-200">
              <div className="flex items-center space-x-2">
                <CertificateColor className="h-6 w-6" />
                <span className="text-caption font-semibold text-gray-650">
                  {t('dashboardHomePage.certificate')}
                </span>
              </div>
              <div className="text-heading font-semibold">{nCertificate}</div>
            </div>
          </a>
        </Link>
      </div>
    </section>
  );
};
