import { useFormik } from 'formik';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useRef, useState } from 'react';
import { AccessControl } from '../app-state/accessControl';
import API_PATHS from '../constants/apiPaths';
import { BACKEND_ADMIN_CONTROL } from '../constants/policies';
import WEB_PATHS from '../constants/webPaths';
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
import { getErrorMessages } from '../utils/error';
import CourseRuleForm from './CourseRuleForm';

const CourseRuleCreatePage = () => {
  const { t } = useTranslation();
  const router = useRouter();

  const [errors, setErrors] = useState([]);

  const scrollRef = useRef(null);
  const executeScroll = () => scrollRef.current.scrollIntoView();

  const handleSubmit = async (body: ICourseRule) => {
    try {
      const { data } = await centralHttp.post(API_PATHS.COURSE_RULES, body);

      router.replace(WEB_PATHS.COURSE_RULE_DETAIL.replace(':id', data.data.id));
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

  return (
    <AccessControl
      policyNames={[
        BACKEND_ADMIN_CONTROL.ACCESS_ADMIN_PORTAL,
        BACKEND_ADMIN_CONTROL.ACCESS_COURSE_MANAGEMENT,
      ]}
    >
      <AdminLayout>
        <Head>
          <title>{t('courseRuleCreatePage.title')}</title>
        </Head>
        <div
          className="mx-auto mt-4 flex w-full flex-1 flex-col justify-start text-center"
          ref={scrollRef}
        >
          <div className="mb-8">
            <h4 className="text-hero-desktop">
              {t('courseRuleCreatePage.title')}
            </h4>
          </div>
          <ErrorMessages
            messages={errors}
            onClearAction={() => setErrors([])}
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

export default CourseRuleCreatePage;
