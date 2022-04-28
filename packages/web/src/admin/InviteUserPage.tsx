import { useFormik } from 'formik';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { FaExclamation } from 'react-icons/fa';
import API_PATHS from '../constants/apiPaths';
import ERRORS from '../constants/error';
import WEB_PATHS from '../constants/webPaths';
import { centralHttp } from '../http';
import OrganizationApi from '../http/organization.api';
import RoleApi from '../http/role.api';
import useTranslation from '../i18n/useTranslation';
import { AdminLayout } from '../layouts/admin.layout';
import InputSection from '../ui-kit/InputSection';
import InputSelect from '../ui-kit/InputSelect';
import { captureError } from '../utils/error-routing';
import inviteUserSchema from './inviteUser.schema';

const InviteUserPage = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const scrollRef = useRef(null);
  const [error, setError] = useState('');
  const [organizations, setOrganizations] = useState([]);
  const [roles, setRoles] = useState([]);

  const formik = useFormik({
    initialValues: {
      email: '',
      lastName: '',
      firstName: '',
      role: '',
      organization: router.query.organization || '',
    },
    enableReinitialize: true,
    validationSchema: inviteUserSchema,
    onSubmit: handleFormSubmit,
  });

  const getOrganizations = async () => {
    const data = await OrganizationApi.getOrganizations();
    setOrganizations(data);
  };

  const getRoles = async () => {
    const data = await RoleApi.getRoles();
    setRoles(data);
  };

  useEffect(() => {
    getOrganizations().catch(captureError);
    getRoles().catch(captureError);
  }, []);

  const renderOrganizations = useMemo(() => {
    return organizations
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((opt) => ({ label: opt.name, value: opt.id }));
  }, [organizations]);

  const renderRoles = useMemo(() => {
    return roles.map((opt) => ({ label: opt.name, value: opt.id }));
  }, [roles]);

  const executeScroll = () => scrollRef.current.scrollIntoView();

  async function handleFormSubmit(values) {
    // return;
    try {
      setError('');
      await centralHttp.post(API_PATHS.INVITATION, values);

      router.push(WEB_PATHS.ADMIN_USER_MANAGEMENT_INVITATION);
    } catch (error) {
      if (error && error.response && error.response.status === 400) {
        if (error.response.data.data) {
          setError(error.response.data.data?.error);
        } else {
          setError(error.response.data.error);
        }
      } else {
        setError(ERRORS.GENERIC_NETWORK_ERROR);
      }

      executeScroll();
    }
  }

  return (
    <AdminLayout>
      <Head>
        <title>{t('headerText')} | Invite user</title>
      </Head>
      <div className="mx-auto mt-4 flex max-w-md flex-col justify-start text-center">
        <div className="mb-8" ref={scrollRef}>
          <h4 className="text-4xl">Invite user</h4>
        </div>
        <div>
          {error ? (
            <div className="mb-3 flex w-full flex-row items-center justify-start bg-red-100 p-5 text-left">
              <FaExclamation className="text-xl text-red-200" />
              <span className="ml-2 text-sm">{error}</span>
            </div>
          ) : null}
        </div>
        <form onSubmit={formik.handleSubmit} autoComplete="off">
          <div className="mb-3 flex w-full flex-row items-baseline justify-center">
            <InputSection
              formik={formik}
              name="firstName"
              placeholder="First Name"
              onBlur={formik.handleBlur}
              inputWrapperClassName="mr-1"
              value={formik.values.firstName}
              onChange={formik.handleChange}
              error={formik.touched.firstName && formik.errors.firstName}
            />
            <InputSection
              formik={formik}
              name="lastName"
              placeholder="Last Name"
              onBlur={formik.handleBlur}
              inputWrapperClassName="ml-1"
              value={formik.values.lastName}
              onChange={formik.handleChange}
              error={formik.touched.lastName && formik.errors.lastName}
            />
          </div>
          <InputSection
            name="email"
            formik={formik}
            placeholder="Email"
            onBlur={formik.handleBlur}
            value={formik.values.email}
            inputWrapperClassName="mb-3"
            onChange={formik.handleChange}
            error={formik.touched.email && formik.errors.email}
          />
          <InputSelect
            name="organization"
            formik={formik}
            options={organizations}
            placeholder="Select..."
            value={{
              label:
                organizations.find((o) => o.id === formik.values.organization)
                  ?.name || 'Select...',
              value: formik.values.organization,
            }}
            renderOptions={renderOrganizations}
            onBlur={formik.handleBlur}
            selectClassWrapperName="mb-3"
            onChange={formik.handleChange}
            error={formik.touched.organization && formik.errors.organization}
          />
          <InputSelect
            name="role"
            formik={formik}
            options={roles}
            value={{
              label:
                roles.find((r) => r.id === formik.values.role)?.name ||
                'Select...',
              value: formik.values.role,
            }}
            renderOptions={renderRoles}
            onBlur={formik.handleBlur}
            selectClassWrapperName="mb-3"
            onChange={formik.handleChange}
            error={formik.touched.role && formik.errors.role}
          />
          <button
            className="outline-none focus:outline-none mb-3 w-full cursor-pointer rounded bg-brand-primary py-2 px-4 font-bold text-white focus:ring"
            type="submit"
          >
            Invite user
          </button>
        </form>
      </div>
    </AdminLayout>
  );
};

export default InviteUserPage;
