import cx from 'classnames';
import {
  CertificationOrientation,
  UserCertificate,
} from '../../models/certificate';
import { ArrowRight, CertificateTemplate, ClockGray } from '../../ui-kit/icons';
import { format } from 'date-fns';
import Link from 'next/link';
import WEB_PATHS from '../../constants/webPaths';
import Button from '../../ui-kit/Button';
import { FaDownload } from 'react-icons/fa';
import { useResponsive } from '../../hooks/useResponsive';
import { BlobProvider } from '@react-pdf/renderer';
import { useEffect, useRef, useState } from 'react';
import { getCertificateTemplateUrl } from '../../admin/certificates/certificate.utils';
import { DocumentPreview } from '../../ui-kit/DocumentPreview';
import fileDownload from 'js-file-download';
import sanitizeFilename from 'sanitize-filename';
import { useAuthInfo } from '../../app-state/useAuthInfo';
import useTranslation from '../../i18n/useTranslation';

interface IUserCertificateCard {
  userCertificate: UserCertificate;
}

export const FileDownloader = ({
  blob,
  title,
  onDownload,
}: {
  blob: Blob;
  title: string;
  onDownload: () => void;
}) => {
  useEffect(() => {
    fileDownload(blob, `${sanitizeFilename(title)}.pdf`);
    onDownload();
  }, [blob, title]);

  return null;
};

export const UserCertificateCard = ({
  userCertificate,
}: IUserCertificateCard) => {
  const {
    context: {
      token: { user },
    },
  } = useAuthInfo();
  const { t } = useTranslation();
  const { lg } = useResponsive();

  const [templateUrl, setTemplateUrl] = useState<string | null>(null);
  const templateUrlHolderRef = useRef<string | null>(null);

  const getMemoizedTemplateUrl = () => {
    if (templateUrlHolderRef.current) {
      setTemplateUrl(templateUrlHolderRef.current);
    } else {
      getCertificateTemplateUrl({ id: userCertificate.certificateId }).then(
        (url) => {
          templateUrlHolderRef.current = url;
          setTemplateUrl(url);
        },
      );
    }
  };

  return (
    <div
      className={cx(
        'rounded-3xl border border-gray-200 bg-gray-100 p-6 hover:bg-white hover:shadow',
      )}
    >
      <div className="mt-0 ml-0 flex lg:mt-4 lg:ml-4">
        <CertificateTemplate className="hidden lg:inline" />

        <div className="ml-0 flex-1 lg:ml-6">
          <div className="text-caption font-semibold text-gray-500">
            {userCertificate.courseTopic?.name || 'Topic'}
          </div>
          <div className="mt-2 font-semibold">{userCertificate.title}</div>
          <div className="mt-4 flex items-center space-x-1 text-caption font-semibold text-gray-500">
            <ClockGray />

            <span>
              {t('dashboardCertificatesPage.completedOn')}{' '}
              {format(new Date(userCertificate.completedDate), 'dd MMM yyyy')}
            </span>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-between">
            <Link
              href={WEB_PATHS.COURSE_DETAIL.replace(
                ':id',
                userCertificate.courseId,
              )}
            >
              <a className="flex items-center space-x-1 text-caption font-semibold text-brand-primary">
                <span>{t('dashboardCertificatesPage.viewCourseDetail')}</span>
                <ArrowRight />
              </a>
            </Link>

            <Button
              avoidFullWidth={lg}
              size="small"
              variant="secondary"
              type="button"
              iconRight={<FaDownload className="ml-4"></FaDownload>}
              className="mt-6 lg:mt-0"
              onClick={getMemoizedTemplateUrl}
            >
              {t('dashboardCertificatesPage.download')}
            </Button>
            {templateUrl && (
              <BlobProvider
                document={
                  <DocumentPreview
                    templateUrl={templateUrl}
                    title={userCertificate.title}
                    name={`${user.firstName} ${user.lastName}`}
                    date={new Date(userCertificate.completedDate)}
                    orientation={
                      userCertificate.orientation ===
                      CertificationOrientation.HORIZONTAL
                        ? 'landscape'
                        : 'portrait'
                    }
                  />
                }
              >
                {({ blob }) =>
                  blob ? (
                    <FileDownloader
                      blob={blob}
                      title={userCertificate.title}
                      onDownload={() => {
                        setTemplateUrl(null);
                      }}
                    />
                  ) : null
                }
              </BlobProvider>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
