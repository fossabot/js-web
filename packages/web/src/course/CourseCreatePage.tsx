import cx from 'classnames';
import { useFormik } from 'formik';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useRef, useState } from 'react';
import { FaPlus } from 'react-icons/fa';
import { AccessControl } from '../app-state/accessControl';
import API_PATHS from '../constants/apiPaths';
import { BACKEND_ADMIN_CONTROL } from '../constants/policies';
import WEB_PATHS from '../constants/webPaths';
import { centralHttp } from '../http';
import UploadApi from '../http/upload.api';
import useTranslation from '../i18n/useTranslation';
import { AdminLayout } from '../layouts/admin.layout';
import {
  CourseCategoryKey,
  courseValidationSchema,
  getCourseOutlineInitialObj,
  ICourse,
} from '../models/course';
import { Language } from '../models/language';
import Button from '../ui-kit/Button';
import { ContentDisclosure } from '../ui-kit/ContentDisclosure';
import ErrorMessages from '../ui-kit/ErrorMessage';
import { getErrorMessages } from '../utils/error';
import CourseForm from './CourseForm';
import CourseOutlineForm from './CourseOutlineForm';

const CourseCreatePage = () => {
  const api = UploadApi;
  const { t } = useTranslation();
  const router = useRouter();

  const [errors, setErrors] = useState([]);
  const [openTab, setOpenTab] = useState(1);
  const [categoryKey, setCategoryKey] = useState('');

  const scrollRef = useRef(null);
  const executeScroll = () => scrollRef.current.scrollIntoView();

  const handleSubmit = async (body: ICourse<Language>) => {
    if (
      categoryKey === CourseCategoryKey.LEARNING_EVENT &&
      body.courseOutlines.find((co) => co.courseSessions.length < 1)
    ) {
      setErrors(['Please select sessions for Learning Event type course.']);
      executeScroll();

      return;
    }
    const payload = {
      ...body,
      courseOutlines: body.courseOutlines.map((co) => ({
        ...co,
        mediaPlaylist: co.mediaPlaylist.map((mp) => mp.id),
      })),
    };

    try {
      if (formik.values.imageFile) {
        const key = await api.uploadCourseImageToS3(formik.values.imageFile);
        formik.setFieldValue('imageKey', key);
        payload.imageKey = key;
      }
      let files = [];
      if (
        formik.values.courseOutlines.find(
          (item) => item.outlineType === 'scorm',
        )
      ) {
        formik.values.courseOutlines
          .filter((o) => o.outlineType === 'scorm')
          .forEach((outline) => {
            files = [...files, ...outline.learningContentFiles];
          });
        const result = await api.getSCORMPresign(files.map((f) => f.name));
        const urls = result.data.reduce(
          (obj, cur) => ({ ...obj, [cur.key]: cur.url }),
          {},
        );
        const promises = files.map((file) => {
          return api.uploadFileToS3(urls[file.name], file);
        });
        await Promise.all(promises);
      }
      const { data } = await centralHttp.post(API_PATHS.COURSES, payload);
      router.push(WEB_PATHS.ADMIN_COURSE_DETAIL.replace(':id', data.data.id));
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
    title: {
      nameEn: '',
      nameTh: '',
    },
    tagLine: {
      nameEn: '',
      nameTh: '',
    },
    categoryId: '',
    durationMinutes: 0,
    durationHours: 0,
    durationDays: 0,
    durationWeeks: 0,
    durationMonths: 0,
    availableLanguage: '',
    description: {
      nameEn: '',
      nameTh: '',
    },
    learningObjective: {
      nameEn: '',
      nameTh: '',
    },
    courseTarget: {
      nameEn: '',
      nameTh: '',
    },
    tagIds: [],
    materialIds: [],
    topicIds: [],
    courseOutlines: [getCourseOutlineInitialObj()],
    status: '',
    isPublic: true,
    imageFile: null,
    imageKey: '',
  };

  const formik = useFormik<ICourse<Language>>({
    initialValues: initialCourseValue,
    validationSchema: courseValidationSchema,
    onSubmit: handleSubmit,
  });

  const onAddCourseOutline = () => {
    formik.setFieldValue('courseOutlines', [
      ...formik.values.courseOutlines,
      getCourseOutlineInitialObj(),
    ]);
  };

  const onRemoveCourseOutline = (i) => {
    if (formik.values.courseOutlines.length > 1) {
      const arr = [...formik.values.courseOutlines];
      arr.splice(i, 1);

      formik.setFieldValue('courseOutlines', arr);
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
          <title>{t('courseCreatePage.title')}</title>
        </Head>
        <div
          className="mx-auto mt-4 flex w-full flex-1 flex-col justify-start text-center"
          ref={scrollRef}
        >
          <div className="mb-8">
            <h4 className="text-hero-desktop">{t('courseCreatePage.title')}</h4>
          </div>
          <ErrorMessages
            messages={errors}
            onClearAction={() => setErrors([])}
          />
          <div className="mx-auto w-278">
            <ul
              className="mb-0 flex list-none flex-row flex-wrap pt-3 pb-4"
              role="tablist"
            >
              <li className="-mb-px mr-2 flex-auto text-center">
                <a
                  className={cx(
                    'block rounded px-5 py-3 text-caption font-bold uppercase leading-normal shadow-lg',
                    openTab === 1
                      ? ' bg-brand-secondary text-white'
                      : ' bg-white text-brand-secondary',
                  )}
                  onClick={(e) => {
                    e.preventDefault();
                    setOpenTab(1);
                  }}
                  data-toggle="tab"
                  role="tablist"
                >
                  Course Info
                </a>
              </li>
              <li className="-mb-px mr-2 flex-auto text-center">
                <a
                  className={cx(
                    'block rounded px-5 py-3 text-caption font-bold uppercase leading-normal shadow-lg',
                    openTab === 2 && formik.values.categoryId
                      ? ' bg-brand-secondary text-white'
                      : ' bg-white text-brand-secondary',
                    !formik.values.categoryId
                      ? 'cursor-not-allowed bg-gray-600 text-white'
                      : '',
                  )}
                  onClick={(e) => {
                    if (!formik.values.categoryId) {
                      return;
                    }
                    e.preventDefault();
                    setOpenTab(2);
                  }}
                  data-toggle="tab"
                  role="tablist"
                >
                  Course Outlines
                </a>
              </li>
            </ul>
            <div className="relative mb-6 flex w-full min-w-0 flex-col break-words rounded shadow-lg">
              <div className="flex-auto px-4 py-5">
                <form onSubmit={formik.handleSubmit} autoComplete="off">
                  <div className="tab-content tab-space mb-6">
                    <div
                      className={openTab === 1 ? 'block' : 'hidden'}
                      id="link1"
                    >
                      <CourseForm
                        formik={formik}
                        setCategoryKey={setCategoryKey}
                      />
                    </div>
                    <div
                      className={cx('mb-6', openTab === 2 ? 'block' : 'hidden')}
                      id="link2"
                    >
                      {formik.values.courseOutlines.map((co, index) => (
                        <ContentDisclosure
                          key={`create-outline-form-${index}`}
                          title={
                            co.part && co.title?.nameEn
                              ? `${co.part}: ${co.title.nameEn}`
                              : `${`Outline ${index + 1}`}`
                          }
                          defaultOpen={co.id === undefined}
                        >
                          <CourseOutlineForm
                            key={`${co.timestamp}`}
                            formik={formik}
                            index={index}
                            categoryKey={categoryKey}
                            onRemoveCourseOutline={onRemoveCourseOutline}
                            courseOutlineMain={co}
                          />
                        </ContentDisclosure>
                      ))}
                    </div>
                    {openTab === 2 ? (
                      <div className="flex w-full flex-row items-end justify-end">
                        <div className="w-1/3 text-right">
                          <Button
                            size="medium"
                            variant="secondary"
                            type="button"
                            iconLeft={
                              <FaPlus
                                className="text-grey-400 mr-2 h-5 w-5"
                                aria-hidden="true"
                              />
                            }
                            onClick={onAddCourseOutline}
                          >
                            Add another course outline
                          </Button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                  <Button
                    size="medium"
                    variant="primary"
                    type="submit"
                    disabled={!formik.isValid || formik.isSubmitting}
                  >
                    Save course
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    </AccessControl>
  );
};

export default CourseCreatePage;
