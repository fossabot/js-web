import { useFormik } from 'formik';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import { AccessControl } from '../../../app-state/accessControl';
import API_PATHS from '../../../constants/apiPaths';
import { BACKEND_ADMIN_CONTROL } from '../../../constants/policies';
import { centralHttp } from '../../../http';
import useTranslation from '../../../i18n/useTranslation';
import { AdminLayout } from '../../../layouts/admin.layout';
import { CertificationType } from '../../../models/certificate';
import {
  certificateUnlockRuleValidationSchema,
  ICertificateUnlockRule,
} from '../../../models/certificateUnlockRule';
import ErrorMessages from '../../../ui-kit/ErrorMessage';
import SuccessMessage from '../../../ui-kit/SuccessMessage';
import { getErrorMessages } from '../../../utils/error';
import { captureError } from '../../../utils/error-routing';
import CertificateUnlockRuleForm from './CertificateUnlockRuleForm';

const CertificateUnlockRuleDetailPage = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = router.query;

  const [, setCertificateUnlockRule] = useState([]);
  const [errors, setErrors] = useState([]);
  const [successTitle, setSuccessTitle] = useState('');

  const scrollRef = useRef(null);
  const executeScroll = () => scrollRef.current.scrollIntoView();

  const handleSubmit = async (body: ICertificateUnlockRule) => {
    try {
      setErrors([]);
      setSuccessTitle('');
      await centralHttp.put(
        API_PATHS.CERTIFICATE_UNLOCK_RULE_DETAIL.replace(':id', id as string),
        body,
      );
      setSuccessTitle('Updated successfully!');
    } catch (err) {
      handleError(err);
    } finally {
      executeScroll();
    }
  };

  const handleError = (error) => {
    const msgs = getErrorMessages(error);
    setErrors(msgs);
  };

  const initialCourseValue = {
    ruleName: '',
    certificateId: '',
    unlockType: CertificationType.COURSE,
    unlockCourseRuleItems: [],
    unlockLearningTrackRuleItems: [],
  };

  const formik = useFormik<ICertificateUnlockRule>({
    initialValues: initialCourseValue,
    validationSchema: certificateUnlockRuleValidationSchema,
    onSubmit: handleSubmit,
  });

  const getCertificateUnlockRule = async (certificateUnlockRuleId: string) => {
    const { data } = await centralHttp.get(
      API_PATHS.CERTIFICATE_UNLOCK_RULE_DETAIL.replace(
        ':id',
        certificateUnlockRuleId,
      ),
    );

    setCertificateUnlockRule(data.data);
    await formik.setValues(data.data);
  };

  useEffect(() => {
    if (id) {
      getCertificateUnlockRule(id as string).catch(captureError);
    }
  }, [id]);

  if (!formik?.values?.id) {
    return null;
  }

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
            {t('headerText')} | {t('certificateUnlockRuleEditPage.metaTitle')}
          </title>
        </Head>
        <div
          className="mx-auto mt-4 flex w-full flex-1 flex-col justify-start text-center"
          ref={scrollRef}
        >
          <div className="mb-8">
            <h4 className="text-hero-desktop">
              {t('certificateUnlockRuleEditPage.title')}
            </h4>
          </div>
          <ErrorMessages
            messages={errors}
            onClearAction={() => setErrors([])}
          />
          <SuccessMessage
            title={successTitle}
            onClearAction={() => setSuccessTitle('')}
          />
          <CertificateUnlockRuleForm formik={formik} />
        </div>
      </AdminLayout>
    </AccessControl>
  );
};

export default CertificateUnlockRuleDetailPage;
