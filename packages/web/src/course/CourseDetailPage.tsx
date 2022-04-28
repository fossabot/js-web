import cx from 'classnames';
import { useFormik } from 'formik';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import { FaDownload, FaPlus } from 'react-icons/fa';
import { AccessControl } from '../app-state/accessControl';
import API_PATHS from '../constants/apiPaths';
import { BACKEND_ADMIN_CONTROL } from '../constants/policies';
import useCourseSessionBulkUpload from '../hooks/useCourseSessionBulkUpload';
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
import FileUploadButton from '../ui-kit/FileUploadButton';
import SuccessMessage from '../ui-kit/SuccessMessage';
import { SystemError } from '../ui-kit/SystemError';
import { getErrorMessages } from '../utils/error';
import CourseForm from './CourseForm';
import CourseOutlineForm from './CourseOutlineForm';
import { setCourseOutlineForm } from './utils';

const CourseDetailPage = () => {
  const api = UploadApi;
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = router.query;

  const [errors, setErrors] = useState([]);
  const [openTab, setOpenTab] = useState(1);
  const [categoryKey, setCategoryKey] = useState('');
  const [course, setCourse] = useState<ICourse<Language>>(null);
  const [successTitle, setSuccessTitle] = useState('');
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const { downloadTemplate, processFile } = useCourseSessionBulkUpload();

  const scrollRef = useRef(null);
  const executeScroll = () => scrollRef.current.scrollIntoView();
  const [errorOnLoad, setErrorOnLoad] = useState<Error | undefined>();

  const getCourse = async (courseId: string) => {
    setErrorOnLoad(undefined);
    const { data } = await centralHttp.get(
      API_PATHS.ADMIN_COURSE_DETAIL.replace(':id', courseId),
    );

    setCourse(data.data);
    setCategoryKey(data.data.category.key);
    await formik.setValues(data.data);

    data.data.courseOutlines.forEach((co, index) => {
      const subCategoryKey = co.category?.key || '';
      setCourseOutlineForm(formik, index, co, subCategoryKey);
    });
  };

  useEffect(() => {
    if (id) {
      getCourse(id as string).catch((err) => {
        setErrorOnLoad(err);
      });
    }
  }, [id]);

  const handleSubmit = async (data: ICourse<Language>) => {
    if (
      categoryKey === CourseCategoryKey.LEARNING_EVENT &&
      data.courseOutlines.find((co) => co.courseSessions.length < 1)
    ) {
      setErrors(['Please select sessions for Learning Event type course.']);
      executeScroll();

      return;
    }

    const payload = {
      ...data,
      courseOutlines: data.courseOutlines.map((co) => ({
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
      if (
        formik.values.courseOutlines.find(
          (item) => item.outlineType === 'scorm',
        )
      ) {
        let files = [];
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
      setErrors([]);
      setSuccessTitle('');
      await centralHttp.put(
        API_PATHS.ADMIN_COURSE_DETAIL.replace(':id', id as string),
        payload,
      );
      formik.setFieldValue('courseOutlines', []);
      await getCourse(id as string);
      setSuccessTitle('Updated successfully!');
    } catch (err) {
      const errors = getErrorMessages(err);
      setErrors(errors);
    } finally {
      executeScroll();
    }
  };

  const handleError = (error) => {
    const msgs = getErrorMessages(error);
    setErrors(msgs);
  };

  const formik = useFormik<ICourse<Language>>({
    initialValues: {
      id: '',
      title: course?.title || { nameEn: '', nameTh: '' },
      tagLine: course?.tagLine || { nameEn: '', nameTh: '' },
      categoryId: '',
      durationMinutes: 0,
      durationHours: 0,
      durationDays: 0,
      durationWeeks: 0,
      durationMonths: 0,
      availableLanguage: '',
      description: { nameEn: '', nameTh: '' },
      learningObjective: { nameEn: '', nameTh: '' },
      courseTarget: { nameEn: '', nameTh: '' },
      tagIds: [],
      materialIds: [],
      topicIds: [],
      courseOutlines: [],
      status: '',
      isPublic: true,
      imageFile: null,
      imageKey: '',
    },
    validationSchema: courseValidationSchema,
    onSubmit: handleSubmit,
  });

  const onAddCourseOutline = () => {
    formik.setFieldValue('courseOutlines', [
      ...formik.values.courseOutlines,
      getCourseOutlineInitialObj(),
    ]);
  };

  const onRemoveCourseOutline = (i: number) => {
    if (formik.values.courseOutlines.length > 1) {
      const arr = [...formik.values.courseOutlines];
      arr.splice(i, 1);

      formik.setFieldValue('courseOutlines', arr);
    }
  };

  if (id && errorOnLoad) {
    return (
      <AdminLayout>
        <Head>
          <title>{t('adminCourseDetailPage.title')}</title>
        </Head>
        <SystemError
          error={errorOnLoad}
          resetError={() => getCourse(id as string).catch(setErrorOnLoad)}
        />
      </AdminLayout>
    );
  }
  if (!formik?.values?.id) {
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleFileChange = async (e: any, files: FileList) => {
    try {
      setErrors([]);
      setSuccessTitle('');
      setIsUploadingFile(true);

      const uploadedCourseSessions = await processFile(e, files);

      for await (const ucs of uploadedCourseSessions) {
        const formikCourseOutlines = formik.values.courseOutlines;
        const coIndex = formikCourseOutlines.findIndex(
          (co) => co.id === ucs.courseOutlineId,
        );

        if (coIndex === -1) {
          throw `Invalid Course Outline Id: ${ucs.courseOutlineId}`;
        }

        await formik.setFieldValue(
          `courseOutlines[${coIndex}].courseSessions`,
          [
            ...formikCourseOutlines[coIndex].courseSessions,
            ...uploadedCourseSessions.filter(
              (u) => u.courseOutlineId === formikCourseOutlines[coIndex].id,
            ),
          ],
        );
      }

      setSuccessTitle('Uploaded successfully!');
    } catch (err) {
      handleError(err);
    } finally {
      e.target.value = null;
      executeScroll();
      setIsUploadingFile(false);
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
          <title>{t('adminCourseDetailPage.title')}</title>
        </Head>
        <div
          className="mx-auto mt-4 flex w-full flex-1 flex-col justify-start text-center"
          ref={scrollRef}
        >
          <div className="mb-8">
            <h4 className="text-hero-desktop">
              {t('adminCourseDetailPage.title')}
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
              {openTab === 2 &&
              formik.values?.courseOutlines[0]?.id &&
              categoryKey === CourseCategoryKey.LEARNING_EVENT ? (
                <div className="mx-3 mt-4 flex items-end justify-end">
                  <div className="mx-1">
                    <FileUploadButton
                      variant="primary"
                      disabled={isUploadingFile}
                      btnText="Bulk upload sessions"
                      onChange={(e) => handleFileChange(e, e.target.files)}
                      accept="application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    />
                  </div>
                  <div className="mx-1">
                    <Button
                      size="medium"
                      variant="primary"
                      type="button"
                      iconLeft={
                        <FaDownload
                          className="text-grey-400 mr-2 h-5 w-5"
                          aria-hidden="true"
                        />
                      }
                      onClick={() =>
                        downloadTemplate(
                          formik.values.courseOutlines.map((co) => ({
                            ...co,
                            course: {
                              title: formik.values.title,
                            } as ICourse<Language>,
                          })),
                        )
                      }
                    >
                      Download sessions template
                    </Button>
                  </div>
                </div>
              ) : null}
              <div className="flex-auto px-4 py-5">
                <form onSubmit={formik.handleSubmit} autoComplete="off">
                  <div className="tab-content tab-space mb-6">
                    <div
                      className={openTab === 1 ? 'block' : 'hidden'}
                      id="link1"
                    >
                      <CourseForm
                        formik={formik}
                        courseMain={course}
                        setCategoryKey={setCategoryKey}
                      />
                    </div>
                    <div
                      className={cx('mb-6', openTab === 2 ? 'block' : 'hidden')}
                      id="link2"
                    >
                      {formik.values.courseOutlines.map((co, index) => (
                        <ContentDisclosure
                          key={`outline-form-${index}`}
                          title={
                            co.part && co.title?.nameEn
                              ? `${co.part}: ${co.title.nameEn}`
                              : `${`Outline ${index + 1}`}`
                          }
                          defaultOpen={co.id === undefined}
                        >
                          <CourseOutlineForm
                            key={`${co.id}`}
                            formik={formik}
                            index={index}
                            courseOutlineMain={course.courseOutlines.find(
                              (cco) => cco.id === co.id,
                            )}
                            categoryKey={categoryKey}
                            onRemoveCourseOutline={onRemoveCourseOutline}
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

export default CourseDetailPage;
