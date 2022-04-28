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
import { enumToArray } from '../utils/array';
import { captureError } from '../utils/error-routing';
import addUserSchema, { Gender, UserTitle } from './addUser.schema';

const AddUserPage = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const scrollRef = useRef(null);
  const [error, setError] = useState('');
  const [organizations, setOrganizations] = useState([]);
  const [roles, setRoles] = useState([]);

  const formik = useFormik({
    initialValues: {
      dob: '',
      email: '',
      lastName: '',
      firstName: '',
      phoneNumber: '',
      jobTitle: '',
      department: '',
      companyName: '',
      companySize: '',
      industry: '',
      gender: Gender.Male,
      title: UserTitle.Mr,
      role: '',
      organization: router.query.organization || '',
    },
    enableReinitialize: true,
    validationSchema: addUserSchema,
    onSubmit: handleFormSubmit,
  });

  const getOrganizations = async () => {
    const list = await OrganizationApi.getOrganizations();
    setOrganizations(list);
  };

  const getRoles = async () => {
    const list = await RoleApi.getRoles();
    setRoles(list);
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
    try {
      setError('');
      await centralHttp.post(API_PATHS.INVITATION, values);

      router.push(WEB_PATHS.ADMIN_USER_MANAGEMENT);
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
        <title>{t('headerText')} | Add new user</title>
      </Head>
      <div className="mx-auto mt-4 flex max-w-md flex-col justify-start text-center">
        <div className="mb-8" ref={scrollRef}>
          <h4 className="text-4xl">Add new user</h4>
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
              label="First Name"
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
              label="Last Name"
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
            label="Email"
            placeholder="Email"
            onBlur={formik.handleBlur}
            value={formik.values.email}
            inputWrapperClassName="mb-3"
            onChange={formik.handleChange}
            error={formik.touched.email && formik.errors.email}
          />
          <InputSection
            name="phoneNumber"
            formik={formik}
            label="Phone number"
            placeholder="Phone number"
            onBlur={formik.handleBlur}
            value={formik.values.phoneNumber}
            inputWrapperClassName="mb-3"
            onChange={formik.handleChange}
          />
          <div className="mb-3 flex w-full flex-row items-baseline justify-center">
            <InputSelect
              name="title"
              label="Title"
              formik={formik}
              options={enumToArray(UserTitle)}
              value={undefined}
              onBlur={formik.handleBlur}
              selectClassWrapperName="mr-1"
              onChange={formik.handleChange}
              error={formik.touched.title && formik.errors.title}
            />
            <InputSelect
              name="gender"
              formik={formik}
              isSearchable={true}
              label="Gender"
              options={enumToArray(Gender)}
              value={undefined}
              onBlur={formik.handleBlur}
              selectClassWrapperName="ml-1"
              onChange={formik.handleChange}
              error={formik.touched.gender && formik.errors.gender}
            />
          </div>
          <InputSection
            name="dob"
            type="date"
            formik={formik}
            label="Date of birth"
            placeholder="Date of birth"
            onBlur={formik.handleBlur}
            value={undefined}
            inputWrapperClassName="mb-3"
            onChange={formik.handleChange}
          />
          <div className="mb-3 flex w-full flex-row items-baseline justify-center">
            <InputSection
              name="jobTitle"
              formik={formik}
              label="Job title"
              placeholder="Job title"
              onBlur={formik.handleBlur}
              value={formik.values.jobTitle}
              inputWrapperClassName="mr-1"
              onChange={formik.handleChange}
            />
            <InputSection
              name="department"
              formik={formik}
              label="Department"
              placeholder="Department"
              onBlur={formik.handleBlur}
              value={formik.values.department}
              inputWrapperClassName="ml-1"
              onChange={formik.handleChange}
            />
          </div>
          <div className="mb-3 flex w-full flex-row items-baseline justify-center">
            <InputSection
              name="companyName"
              formik={formik}
              label="Company name"
              placeholder="Company name"
              onBlur={formik.handleBlur}
              value={formik.values.companyName}
              inputWrapperClassName="mr-1"
              onChange={formik.handleChange}
            />
            {/* TODO */}
            <InputSelect
              name="companySize"
              formik={formik}
              label="Company size"
              options={[]}
              value={undefined}
              onBlur={formik.handleBlur}
              selectClassWrapperName="ml-1"
              onChange={formik.handleChange}
            />
          </div>
          {/* TODO */}
          <InputSelect
            name="industry"
            formik={formik}
            label="Industry"
            options={[]}
            value={undefined}
            onBlur={formik.handleBlur}
            selectClassWrapperName="mb-3"
            onChange={formik.handleChange}
            error={formik.touched.industry && formik.errors.industry}
          />
          <InputSelect
            name="organization"
            formik={formik}
            label="Organization"
            options={organizations}
            value={{
              label:
                organizations.find((o) => o.id === formik.values.organization)
                  ?.name || 'Select...',
              value: formik.values.organization,
            }}
            renderOptions={renderOrganizations}
            placeholder="Select Organization"
            onBlur={formik.handleBlur}
            selectClassWrapperName="mb-3"
            onChange={formik.handleChange}
            error={formik.touched.organization && formik.errors.organization}
          />
          <InputSelect
            name="role"
            formik={formik}
            label="Role"
            options={roles}
            value={{
              label:
                roles.find((r) => r.id === formik.values.role)?.name ||
                'Select...',
              value: formik.values.role,
            }}
            renderOptions={renderRoles}
            placeholder="Select Role"
            onBlur={formik.handleBlur}
            selectClassWrapperName="mb-3"
            onChange={formik.handleChange}
            error={formik.touched.role && formik.errors.role}
          />
          <button
            className="outline-none focus:outline-none mb-3 w-full cursor-pointer rounded bg-brand-primary py-2 px-4 font-bold text-white focus:ring"
            type="submit"
          >
            Save and invite user
          </button>
        </form>
      </div>
    </AdminLayout>
  );
};

export default AddUserPage;
