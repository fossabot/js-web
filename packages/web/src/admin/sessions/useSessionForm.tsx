import { useFormik } from 'formik';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import { centralHttp } from '../../http';
import API_PATHS from '../../constants/apiPaths';
import { sessionSchema } from './session.schema';
import WEB_PATHS from '../../constants/webPaths';
import { ERROR_CODES } from '../../constants/errors';
import { useModal } from '../../ui-kit/HeadlessModal';
import useAsyncInput from '../../hooks/useAsyncInput';
import { DEFAULT_ROLES } from '../../constants/roles';
import {
  CourseCategoryKey,
  CourseLanguage,
  ICourseSession,
} from '../../models/course';

export const useSessionForm = () => {
  const router = useRouter();
  const instructorOverlapModalProps = useModal();
  const [instructorOverlapModalData, setInstructorOverlapModalData] =
    useState(null);
  const [, setErrorOnLoad] = useState<Error | undefined>();
  const [courseSession, setCourseSession] = useState<ICourseSession>(null);

  const id = router.query.id as string;
  const initialSessionValue: Partial<ICourseSession> = {
    seats: 1,
    location: '',
    webinarTool: '',
    instructorId: '',
    isPrivate: false,
    participantUrl: '',
    courseOutlineId: '',
    language: CourseLanguage.EN,
    endDateTime: new Date().toISOString(),
    startDateTime: new Date().toISOString(),
  };

  async function onSubmit(val) {
    try {
      if (id) {
        await centralHttp.put(
          API_PATHS.COURSE_SESSION_BY_ID.replace(':id', id),
          val,
        );
        router.push(
          WEB_PATHS.SESSION_PARTICIPANTS_MANAGEMENT.replace(':id', id),
        );
        return;
      }

      const { data } = await centralHttp.post(API_PATHS.COURSE_SESSIONS, val);
      router.push(
        WEB_PATHS.SESSION_PARTICIPANTS_MANAGEMENT.replace(':id', data.data.id),
      );
    } catch (error) {
      if (
        error.response?.data?.code ===
        ERROR_CODES.INSTRUCTOR_SESSION_TIME_OVERLAP.code
      ) {
        setInstructorOverlapModalData(error.response.data.data);
        instructorOverlapModalProps.toggle(true);
        return;
      }

      console.error(error);
    }
  }

  const formik = useFormik<Partial<ICourseSession>>({
    validationSchema: sessionSchema,
    initialValues: initialSessionValue,
    onSubmit,
  });

  const getCourseSession = async (sessionId: string) => {
    setErrorOnLoad(undefined);
    formik.setSubmitting(true);
    const { data } = await centralHttp.get(
      API_PATHS.COURSE_SESSION_BY_ID.replace(':id', sessionId),
    );

    setCourseSession(data.data);
    await formik.setValues(data.data);
    formik.setSubmitting(false);
  };

  useEffect(() => {
    if (id) {
      getCourseSession(id as string).catch((err) => {
        setErrorOnLoad(err);
        formik.setSubmitting(false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  function getCustomLabelForCourseOutline(courseOutline) {
    if (!courseOutline) {
      return '';
    }

    return (
      <div>
        <div className="text-sm">{courseOutline.course.title}</div>
        <div className="text-xs">
          {courseOutline.part}: {courseOutline.title}
        </div>
      </div>
    );
  }

  function getCustomLabelForInstructor(instructor) {
    if (!instructor) {
      return '';
    }

    return (
      <div className="text-sm">
        {`${instructor.firstName} ${instructor.lastName}`.trim()} (
        {instructor.email})
      </div>
    );
  }

  const {
    options: outlineOptions,
    getOptions: getOutlineOptions,
    inputValue: outlineInputValue,
  } = useAsyncInput({
    http: centralHttp.get,
    apiPath: API_PATHS.COURSE_OUTLINES,
    formikFieldValue: formik.values.courseOutlineId,
    customLabel: getCustomLabelForCourseOutline,
    fieldName: 'title',
    apiParams: {
      id: formik.values.courseOutlineId || router.query.id || undefined,
      search: CourseCategoryKey.LEARNING_EVENT,
      searchField: 'courseCategoryKey',
    },
  });

  const { getOptions: getInstructorOptions, inputValue: instructorInputValue } =
    useAsyncInput({
      http: centralHttp.get,
      apiPath: API_PATHS.ADMIN_USERS,
      formikFieldValue: formik.values.instructorId,
      customLabel: getCustomLabelForInstructor,
      fieldName: 'email',
      apiParams: {
        id: formik.values.instructorId || undefined,
        role: DEFAULT_ROLES.INSTRUCTOR.toUpperCase(),
      },
    });

  return {
    formik,
    router,
    courseSession,
    getOutlineOptions,
    outlineInputValue,
    getInstructorOptions,
    instructorInputValue,
    instructorOverlapModalData,
    instructorOverlapModalProps,
    outlineOptions,
  };
};
