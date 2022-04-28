import { useFormik } from 'formik';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useRef, useState } from 'react';
import { AccessControl } from '../../../app-state/accessControl';
import API_PATHS from '../../../constants/apiPaths';
import { BACKEND_ADMIN_CONTROL } from '../../../constants/policies';
import WEB_PATHS from '../../../constants/webPaths';
import { centralHttp } from '../../../http';
import useTranslation from '../../../i18n/useTranslation';
import { AdminLayout } from '../../../layouts/admin.layout';
import { CertificationType } from '../../../models/certificate';
import {
  certificateUnlockRuleValidationSchema,
  ICertificateUnlockRule,
} from '../../../models/certificateUnlockRule';
import ErrorMessages from '../../../ui-kit/ErrorMessage';
import { getErrorMessages } from '../../../utils/error';
import CertificateUnlockRuleForm from './CertificateUnlockRuleForm';

const CertificateUnlockRuleCreatePage = () => {
  const { t } = useTranslation();
  const router = useRouter();

  const [errors, setErrors] = useState([]);

  const scrollRef = useRef(null);
  const executeScroll = () => scrollRef.current.scrollIntoView();

  const handleSubmit = async (body: ICertificateUnlockRule) => {
    try {
      const { data } = await centralHttp.post(
        API_PATHS.CERTIFICATE_UNLOCK_RULES,
        body,
      );

      router.replace(
        WEB_PATHS.CERTIFICATE_UNLOCK_RULE_DETAIL.replace(':id', data.data.id),
      );
      return;
    } catch (err) {
      handleError(err);
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
            {t('headerText')} | {t('certificateUnlockRuleCreatePage.metaTitle')}
          </title>
        </Head>
        <div
          className="mx-auto mt-4 flex w-full flex-1 flex-col justify-start text-center"
          ref={scrollRef}
        >
          <div className="mb-8">
            <h4 className="text-hero-desktop">
              {t('certificateUnlockRuleCreatePage.title')}
            </h4>
          </div>
          <ErrorMessages
            messages={errors}
            onClearAction={() => setErrors([])}
          />
          <CertificateUnlockRuleForm formik={formik} />
        </div>
      </AdminLayout>
    </AccessControl>
  );
};

export default CertificateUnlockRuleCreatePage;
