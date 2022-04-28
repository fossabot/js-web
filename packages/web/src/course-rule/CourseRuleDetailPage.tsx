import { useFormik } from 'formik';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import { AccessControl } from '../app-state/accessControl';
import API_PATHS from '../constants/apiPaths';
import { BACKEND_ADMIN_CONTROL } from '../constants/policies';
import { centralHttp } from '../http';
import useTranslation from '../i18n/useTranslation';
import { AdminLayout } from '../layouts/admin.layout';
import {
  CourseRuleType,
  courseRuleValidationSchema,
  ICourseRule,
  ICourseRuleItem,
} from '../models/course-rule';
import ErrorMessages from '../ui-kit/ErrorMessage';
import SuccessMessage from '../ui-kit/SuccessMessage';
import { getErrorMessages } from '../utils/error';
import CourseRuleForm from './CourseRuleForm';

const CourseRuleDetailPage = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = router.query;

  const [, setCourseRule] = useState([]);
  const [errors, setErrors] = useState([]);
  const [successTitle, setSuccessTitle] = useState('');

  const scrollRef = useRef(null);
  const executeScroll = () => scrollRef.current.scrollIntoView();

  const getCourseRule = async (courseId: string) => {
    const { data } = await centralHttp.get(
      API_PATHS.COURSE_RULE_DETAIL.replace(':id', courseId),
    );

    setCourseRule(data.data);
    await formik.setValues(data.data);
  };

  useEffect(() => {
    if (id) {
      getCourseRule(id as string);
    }
  }, [id]);

  const handleSubmit = async (body: ICourseRule) => {
    try {
      setErrors([]);
      setSuccessTitle('');
      await centralHttp.put(
        API_PATHS.COURSE_RULE_DETAIL.replace(':id', id as string),
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

  const getCourseRuleItemInitialObj: () => ICourseRuleItem = () => ({
    appliedById: '',
    appliedForId: '',
    type: CourseRuleType.REQUIRED,
  });

  const initialCourseValue = {
    name: '',
    courseRuleItems: [getCourseRuleItemInitialObj()],
  };

  const formik = useFormik<ICourseRule>({
    initialValues: initialCourseValue,
    validationSchema: courseRuleValidationSchema,
    onSubmit: handleSubmit,
  });

  const onAddCourseRuleItem = () => {
    formik.setFieldValue('courseRuleItems', [
      ...formik.values.courseRuleItems,
      getCourseRuleItemInitialObj(),
    ]);
  };

  const onRemoveCourseRuleItem = (i: number) => {
    if (formik.values.courseRuleItems.length > 1) {
      const arr = [...formik.values.courseRuleItems];
      arr.splice(i, 1);

      formik.setFieldValue('courseRuleItems', arr);
    }
  };

  if (!formik?.values?.id) {
    return null;
  }

  return (
    <AccessControl
      policyNames={[
        BACKEND_ADMIN_CONTROL.ACCESS_ADMIN_PORTAL,
        BACKEND_ADMIN_CONTROL.ACCESS_COURSE_MANAGEMENT,
      ]}
    >
      <AdminLayout>
        <Head>
          <title>{t('courseRuleDetailPage.title')}</title>
        </Head>
        <div
          className="mx-auto mt-4 flex w-full flex-1 flex-col justify-start text-center"
          ref={scrollRef}
        >
          <div className="mb-8">
            <h4 className="text-hero-desktop">
              {t('courseRuleDetailPage.title')}
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
          <CourseRuleForm
            formik={formik}
            onAddCourseRuleItem={onAddCourseRuleItem}
            onRemoveCourseRuleItem={onRemoveCourseRuleItem}
          />
        </div>
      </AdminLayout>
    </AccessControl>
  );
};

export default CourseRuleDetailPage;
