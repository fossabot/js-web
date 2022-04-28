import { useFormik } from 'formik';
import Head from 'next/head';
import { useEffect } from 'react';
import * as Yup from 'yup';
import { AccessControl } from '../app-state/accessControl';
import { BACKEND_ADMIN_CONTROL } from '../constants/policies';
import AdminSettingApi from '../http/admin.setting.api';
import useTranslation from '../i18n/useTranslation';
import { AdminLayout } from '../layouts/admin.layout';
import InputSection from '../ui-kit/InputSection';
import { captureError } from '../utils/error-routing';

export default function LoginSetting() {
  const api = AdminSettingApi;
  const { t } = useTranslation();

  const lockDurationSchema = Yup.object({
    maxAttempts: Yup.number().required('Required'),
    lockDuration: Yup.number().min(30).max(360).required('Required'),
  });

  const handleSubmit = async (values: {
    id: string;
    maxAttempts: number;
    lockDuration: number;
  }) => {
    try {
      await api.updateLoginSetting(values.id, values);
      alert('success');
    } catch (e) {
      alert('failed, ' + e);
    }
  };

  const formik = useFormik({
    initialValues: {
      id: '',
      maxAttempts: 0,
      lockDuration: 0,
    },
    validationSchema: lockDurationSchema,
    onSubmit: handleSubmit,
  });

  useEffect(() => {
    (async function fetchData() {
      try {
        const response = await api.getLoginSetting();
        formik.setValues(response);
      } catch (error) {
        captureError(error);
      }
    })();
  }, []);

  return (
    <AccessControl
      policyNames={[
        BACKEND_ADMIN_CONTROL.ACCESS_ADMIN_PORTAL,
        BACKEND_ADMIN_CONTROL.ACCESS_LOGIN_SETTINGS,
      ]}
    >
      <AdminLayout>
        <Head>
          <title>{t('headerText')} | Login Setting</title>
        </Head>
        <div className="rounded bg-white p-5">
          <h1 className="text-lg font-bold">Login Setting</h1>
          <hr className="mb-5" />
          <h3 className="text-md font-bold">Login Rules</h3>
          <form onSubmit={formik.handleSubmit} autoComplete="off">
            <div className="mb-3">
              <label htmlFor="">Max Attempts:</label>
              <InputSection
                formik={formik}
                type="number"
                name="maxAttempts"
                placeholder="Max attempt count before lock the account."
                value={formik.values.maxAttempts}
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                error={formik.touched.maxAttempts && formik.errors.maxAttempts}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="">Lock Duration (Minutes)</label>
              <InputSection
                formik={formik}
                type="number"
                name="lockDuration"
                placeholder="Account lock duration."
                value={formik.values.lockDuration}
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                error={
                  formik.touched.lockDuration && formik.errors.lockDuration
                }
              />
            </div>
            <button
              className="rounded bg-blue-400 py-2 px-4 text-white hover:bg-blue-300"
              type="submit"
            >
              Submit
            </button>
          </form>
        </div>
      </AdminLayout>
    </AccessControl>
  );
}
