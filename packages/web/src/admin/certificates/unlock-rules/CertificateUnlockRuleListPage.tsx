import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { FaTrash } from 'react-icons/fa';
import { AccessControl } from '../../../app-state/accessControl';
import API_PATHS from '../../../constants/apiPaths';
import { BACKEND_ADMIN_CONTROL } from '../../../constants/policies';
import WEB_PATHS from '../../../constants/webPaths';
import useList from '../../../hooks/useList';
import { centralHttp } from '../../../http';
import useTranslation from '../../../i18n/useTranslation';
import { AdminLayout } from '../../../layouts/admin.layout';
import Button from '../../../ui-kit/Button';
import ConfirmationModal from '../../../ui-kit/ConfirmationModal';
import DropdownButton from '../../../ui-kit/DropdownButton';
import ErrorMessages from '../../../ui-kit/ErrorMessage';
import { useModal } from '../../../ui-kit/Modal';
import { getErrorMessages } from '../../../utils/error';
import CertificateUnlockRuleList from './CertificateUnlockRuleList';

const CertificateUnlockRuleListPage = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { data, totalPages, fetchData } = useList<any>((options) => {
    return getCertificateUnlockRules(options);
  });
  const [selectedCertificateUnlockRules, setSelectedCertificateUnlockRules] =
    useState([]);
  const [isSelectAll, setSelectAll] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState([]);
  const deleteModalState = useModal();

  useEffect(() => {
    if (isSelectAll)
      setSelectedCertificateUnlockRules([...data.map((item) => item.id)]);
    else setSelectedCertificateUnlockRules([]);
  }, [isSelectAll]);

  const getCertificateUnlockRules = (options?) => {
    return centralHttp.get(API_PATHS.CERTIFICATE_UNLOCK_RULES, {
      params: options,
    });
  };

  const onClickSelect = (id: string) => {
    if (selectedCertificateUnlockRules.includes(id)) {
      setSelectedCertificateUnlockRules(
        selectedCertificateUnlockRules.filter((id) => id !== id),
      );
    } else {
      setSelectedCertificateUnlockRules([
        ...selectedCertificateUnlockRules,
        id,
      ]);
    }
  };

  const onClickDelete = () => {
    deleteModalState.toggle();
  };

  const onConfirmDelete = async () => {
    try {
      setSubmitting(true);
      setErrors([]);
      await centralHttp.delete(API_PATHS.CERTIFICATE_UNLOCK_RULES, {
        data: { ids: selectedCertificateUnlockRules },
      });
      setSelectedCertificateUnlockRules([]);
      fetchData();
    } catch (e) {
      handleError(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleError = (error) => {
    const msgs = getErrorMessages(error);
    setErrors(msgs);
  };

  return (
    <AccessControl
      policyNames={[
        BACKEND_ADMIN_CONTROL.ACCESS_ADMIN_PORTAL,
        BACKEND_ADMIN_CONTROL.ACCESS_CERTIFICATE_MANAGEMENT,
      ]}
    >
      <AdminLayout>
        <Head>
          <title>
            {t('headerText')} | {t('certificateUnlockRuleListPage.metaTitle')}
          </title>
        </Head>
        <div className="mx-6 lg:mx-8">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex w-1/4">
              <h2 className="py-2 text-left font-bold text-black">
                {t('certificateUnlockRuleListPage.title')}
              </h2>
            </div>
            <div className="mb-4 flex w-3/4 flex-row items-center justify-end text-right">
              <ErrorMessages
                messages={errors}
                onClearAction={() => setErrors([])}
              />
              <div className="mx-1 w-1/3">
                <Button
                  size="medium"
                  type="submit"
                  variant="primary"
                  onClick={() =>
                    router.push(WEB_PATHS.CERTIFICATE_UNLOCK_RULE_CREATE)
                  }
                >
                  {t('certificateUnlockRuleListPage.addNewRule')}
                </Button>
              </div>
              <DropdownButton
                wrapperClassNames={'mx-1 w-2/6'}
                buttonName={'Actions'}
                menuItems={[
                  {
                    name: 'Delete rules',
                    action: onClickDelete,
                    isDisabled:
                      selectedCertificateUnlockRules.length < 1 || isSubmitting,
                    activeIcon: (
                      <FaTrash
                        className="mr-2 h-5 w-5 text-red-200"
                        aria-hidden="true"
                      />
                    ),
                    inactiveIcon: (
                      <FaTrash
                        className="mr-2 h-5 w-5 text-red-200"
                        aria-hidden="true"
                      />
                    ),
                  },
                ]}
              />
            </div>
          </div>
          <CertificateUnlockRuleList
            certificateUnlockRules={data}
            totalPages={totalPages}
            onClickSelect={onClickSelect}
            isSelectAll={isSelectAll}
            setSelectAll={setSelectAll}
            selectedCertificateUnlockRules={selectedCertificateUnlockRules}
          />
        </div>
        <ConfirmationModal
          body={<p>{t('certificateUnlockRuleListPage.deleteModalMsg')}</p>}
          header="Delete Certificate Unlock Rule"
          onOk={onConfirmDelete}
          isOpen={deleteModalState.isOpen}
          toggle={deleteModalState.toggle}
        />
      </AdminLayout>
    </AccessControl>
  );
};

export default CertificateUnlockRuleListPage;
