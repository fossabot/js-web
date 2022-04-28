import axios from 'axios';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useRef, useState } from 'react';
import { FaDownload, FaPaperclip } from 'react-icons/fa';
import { AccessControl } from '../../app-state/accessControl';
import { BACKEND_ADMIN_CONTROL, PolicyEnum } from '../../constants/policies';
import { centralHttp } from '../../http';
import useTranslation from '../../i18n/useTranslation';
import { AdminLayout } from '../../layouts/admin.layout';
import Button from '../../ui-kit/Button';
import ErrorMessages from '../../ui-kit/ErrorMessage';
import FileUploadButton from '../../ui-kit/FileUploadButton';
import SuccessMessage from '../../ui-kit/SuccessMessage';
import { getErrorMessages } from '../../utils/error';

export interface IBulkUploadPageProps {
  pageTitle: string;
  downloadTemplate: () => Promise<void>;
  processFile: (e: any, files: FileList) => Promise<any>;
  uploadApiPath: string;
  uploadKey: string;
  presignedApiPath: string;
  historyPath: string;
  policyNames: PolicyEnum[];
}

export const BulkUploadPage = ({
  pageTitle,
  downloadTemplate,
  processFile,
  uploadApiPath,
  uploadKey,
  presignedApiPath,
  policyNames,
  historyPath,
}: IBulkUploadPageProps) => {
  const [errors, setErrors] = useState([]);
  const [successTitle, setSuccessTitle] = useState('');
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);

  const scrollRef = useRef(null);
  const executeScroll = () => scrollRef.current.scrollIntoView();

  const router = useRouter();
  const { t } = useTranslation();

  const onDownloadTemplate = async () => {
    setIsDownloadingTemplate(true);
    await downloadTemplate();
    setIsDownloadingTemplate(false);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleFileChange = async (e: any, files: FileList) => {
    try {
      setErrors([]);
      setSuccessTitle('');
      setIsUploadingFile(true);

      const fileToUpload = await processFile(e, files);
      const s3Key = await uploadLearningTrackAssignedFileToS3(files[0]);

      await centralHttp.post(uploadApiPath, {
        [uploadKey]: fileToUpload,
        metadata: {
          key: s3Key,
          fileName: files[0].name,
        },
      });

      setSuccessTitle('Uploaded successfully!');
      executeScroll();
      setTimeout(() => router.push(historyPath), 500);
    } catch (err) {
      handleError(err);
      executeScroll();
    } finally {
      e.target.value = null;
      setIsUploadingFile(false);
    }
  };

  const uploadLearningTrackAssignedFileToS3 = async (file: File) => {
    const response = await centralHttp.post(presignedApiPath, {
      fileName: file.name,
      fileType: file.type,
    });
    const { url, key } = response.data.data;

    await axios.put(url, file, {
      headers: {
        'Content-Type': file.type,
      },
    });

    return key;
  };

  const handleError = (error) => {
    const msgs = getErrorMessages(error);
    setErrors(msgs);
  };

  return (
    <AccessControl
      policyNames={[BACKEND_ADMIN_CONTROL.ACCESS_ADMIN_PORTAL, ...policyNames]}
    >
      <AdminLayout>
        <Head>
          <title>
            {t('headerText')} | {pageTitle}
          </title>
        </Head>
        <div className="mx-6 text-right lg:mx-8" ref={scrollRef}>
          <div className="mr-4">
            <ErrorMessages
              messages={errors}
              onClearAction={() => setErrors([])}
            />
            <SuccessMessage
              title={successTitle}
              onClearAction={() => setSuccessTitle('')}
            />
          </div>
          <div className="mb-2 flex items-center justify-between">
            <div className="flex w-1/4">
              <h2 className="mb-2 py-2 text-left font-bold text-black">
                {pageTitle}
              </h2>
            </div>
            <div className="mx-3 mt-4 flex items-end justify-end">
              <div className="mx-1">
                <Button
                  size="medium"
                  variant="secondary"
                  type="button"
                  iconLeft={
                    <FaPaperclip
                      className="text-grey-400 mr-2 h-5 w-5"
                      aria-hidden="true"
                    />
                  }
                  link={historyPath}
                >
                  View Upload history
                </Button>
              </div>
              <div className="mx-1">
                <FileUploadButton
                  variant="primary"
                  // disabled={isUploadingFile}
                  btnText="Bulk upload"
                  onChange={(e) => handleFileChange(e, e.target.files)}
                  accept="application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                />
              </div>
              <div className="mx-1">
                <Button
                  size="medium"
                  variant="primary"
                  type="button"
                  disabled={isUploadingFile || isDownloadingTemplate}
                  iconLeft={
                    <FaDownload
                      className="text-grey-400 mr-2 h-5 w-5"
                      aria-hidden="true"
                    />
                  }
                  onClick={() => onDownloadTemplate()}
                >
                  Download template
                </Button>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    </AccessControl>
  );
};
