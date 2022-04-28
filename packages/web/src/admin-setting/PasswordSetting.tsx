import { useFormik } from 'formik';
import Head from 'next/head';
import { useEffect } from 'react';
import { AccessControl } from '../app-state/accessControl';
import { BACKEND_ADMIN_CONTROL } from '../constants/policies';
import AdminSettingApi from '../http/admin.setting.api';
import useTranslation from '../i18n/useTranslation';
import { AdminLayout } from '../layouts/admin.layout';
import InputSection from '../ui-kit/InputSection';
import { captureError } from '../utils/error-routing';

export default function PasswordSetting() {
  const api = AdminSettingApi;
  const { t } = useTranslation();

  const handleSubmit = async (values: {
    id: string;
    expireIn: number;
    notifyIn: number;
  }) => {
    try {
      await api.updatePasswordSetting(values.id, values);
      alert('success');
    } catch (e) {
      alert('failed, ' + e);
    }
  };

  const formik = useFormik({
    initialValues: {
      id: '',
      expireIn: 0,
      notifyIn: 0,
    },
    onSubmit: handleSubmit,
  });

  useEffect(() => {
    (async function fetchData() {
      try {
        const response = await api.getPasswordSetting();
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
        BACKEND_ADMIN_CONTROL.ACCESS_PASSWORD_SETTINGS,
      ]}
    >
      <AdminLayout>
        <Head>
          <title>{t('headerText')} | Password Setting</title>
        </Head>
        <div className="rounded bg-white p-5">
          <h1 className="text-lg font-bold">Password Setting</h1>
          <hr className="mb-5" />
          <form onSubmit={formik.handleSubmit} autoComplete="off">
            <div className="mb-3">
              <label htmlFor="">Password Expiration In (days)</label>
              <InputSection
                formik={formik}
                type="number"
                name="expireIn"
                placeholder="Password Expiration In (days)"
                value={formik.values.expireIn}
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                error={formik.touched.expireIn && formik.errors.expireIn}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="">Notify Date (days before expired)</label>
              <InputSection
                formik={formik}
                type="number"
                name="notifyIn"
                placeholder="Notify Date (days before expired)"
                value={formik.values.notifyIn}
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                error={formik.touched.notifyIn && formik.errors.notifyIn}
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
