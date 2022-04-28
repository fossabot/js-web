import cx from 'classnames';
import { useFormik } from 'formik';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import { FaPlus } from 'react-icons/fa';
import { AccessControl } from '../../app-state/accessControl';
import API_PATHS from '../../constants/apiPaths';
import { BACKEND_ADMIN_CONTROL } from '../../constants/policies';
import { centralHttp } from '../../http';
import UploadApi from '../../http/upload.api';
import useTranslation from '../../i18n/useTranslation';
import { AdminLayout } from '../../layouts/admin.layout';
import { Language } from '../../models/language';
import {
  ILearningTrack,
  ILearningTrackSection,
  learningTrackValidationSchema,
} from '../../models/learningTrack';
import Button from '../../ui-kit/Button';
import { ContentDisclosure } from '../../ui-kit/ContentDisclosure';
import ErrorMessages from '../../ui-kit/ErrorMessage';
import SuccessMessage from '../../ui-kit/SuccessMessage';
import { getErrorMessages } from '../../utils/error';
import { captureError } from '../../utils/error-routing';
import LearningTrackForm from './LearningTrackForm';
import LearningTrackSectionForm from './LearningTrackSectionForm';

const LearningTrackDetailPage = () => {
  const api = UploadApi;
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = router.query;

  const [errors, setErrors] = useState([]);
  const [openTab, setOpenTab] = useState(1);
  const [learningTrack, setLearningTrack] =
    useState<ILearningTrack<Language> | null>(null);
  const [successTitle, setSuccessTitle] = useState('');

  const scrollRef = useRef(null);
  const executeScroll = () => scrollRef.current.scrollIntoView();

  const getLearningTrack = async (learningTrackId: string) => {
    const { data } = await centralHttp.get(
      API_PATHS.ADMIN_LEARNING_TRACK_DETAIL.replace(':id', learningTrackId),
    );

    setLearningTrack(data.data);
    await formik.setValues(data.data);
  };

  useEffect(() => {
    if (id) {
      getLearningTrack(id as string).catch(captureError);
    }
  }, [id]);

  const handleSubmit = async (body: ILearningTrack<Language>) => {
    const payload = {
      ...body,
      learningTrackSections: body.learningTrackSections.map((lts) => ({
        ...lts,
        courseIds: lts.courses.map((c) => c.id),
        courses: lts.courses.map((c) => ({
          id: c.id,
          isRequired: c.isRequired,
        })),
      })),
    };

    try {
      if (formik.values.imageFile) {
        const key = await api.uploadLearningTrackImageToS3(
          formik.values.imageFile,
        );
        formik.setFieldValue('imageKey', key);
        payload.imageKey = key;
      }

      setErrors([]);
      setSuccessTitle('');
      await centralHttp.put(
        API_PATHS.ADMIN_LEARNING_TRACK_DETAIL.replace(':id', id as string),
        payload,
      );
      await getLearningTrack(id as string);
      setSuccessTitle('Updated successfully!');
    } catch (err) {
      const errors = getErrorMessages(err);
      setErrors(errors);
    } finally {
      executeScroll();
    }
  };

  const getLearningTrackSectionInitialObj =
    (): ILearningTrackSection<Language> => ({
      title: {
        nameEn: '',
        nameTh: '',
      },
      part: 1,
      courseIds: [],
      courses: [],
    });

  const initialLearningTrackValue: ILearningTrack<Language> = {
    title: learningTrack?.title || { nameEn: '', nameTh: '' },
    tagLine: learningTrack?.tagLine || { nameEn: '', nameTh: '' },
    durationMinutes: 0,
    durationHours: 0,
    durationDays: 0,
    durationWeeks: 0,
    durationMonths: 0,
    isFeatured: false,
    status: '',
    categoryId: '',
    description: {
      nameEn: '',
      nameTh: '',
    },
    learningObjective: {
      nameEn: '',
      nameTh: '',
    },
    learningTrackTarget: {
      nameEn: '',
      nameTh: '',
    },
    tagIds: [],
    materialIds: [],
    topicIds: [],
    learningTrackSections: [getLearningTrackSectionInitialObj()],
    isPublic: true,
    imageFile: null,
    imageKey: '',
  };

  const formik = useFormik<ILearningTrack<Language>>({
    initialValues: initialLearningTrackValue,
    validationSchema: learningTrackValidationSchema,
    onSubmit: handleSubmit,
  });

  const onAddLearningTrackSection = () => {
    formik.setFieldValue('learningTrackSections', [
      ...formik.values.learningTrackSections,
      getLearningTrackSectionInitialObj(),
    ]);
  };

  const onRemoveLearningTrackSection = (i) => {
    if (formik.values.learningTrackSections.length > 1) {
      const arr = [...formik.values.learningTrackSections];
      arr.splice(i, 1);

      formik.setFieldValue('learningTrackSections', arr);
    }
  };

  if (!formik?.values?.id) {
    return null;
  }

  return (
    <AccessControl
      policyNames={[
        BACKEND_ADMIN_CONTROL.ACCESS_ADMIN_PORTAL,
        BACKEND_ADMIN_CONTROL.ACCESS_LEARNING_TRACK_MANAGEMENT,
      ]}
    >
      <AdminLayout>
        <Head>
          <title>{t('learningTrackAdminDetailPage.title')}</title>
        </Head>
        <div
          className="mx-auto mt-4 flex w-full flex-1 flex-col justify-start text-center"
          ref={scrollRef}
        >
          <div className="mb-8">
            <h4 className="text-hero-desktop">
              {t('learningTrackAdminDetailPage.title')}
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
                  Learning Track Info
                </a>
              </li>
              <li className="-mb-px mr-2 flex-auto text-center">
                <a
                  className={cx(
                    'block rounded px-5 py-3 text-caption font-bold uppercase leading-normal shadow-lg',
                    openTab === 2
                      ? ' bg-brand-secondary text-white'
                      : ' bg-white text-brand-secondary',
                  )}
                  onClick={(e) => {
                    e.preventDefault();
                    setOpenTab(2);
                  }}
                  data-toggle="tab"
                  role="tablist"
                >
                  Learning Track Sections
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
                      <LearningTrackForm
                        formik={formik}
                        learningTrackMain={learningTrack}
                      />
                    </div>
                    <div
                      className={cx('mb-6', openTab === 2 ? 'block' : 'hidden')}
                      id="link2"
                    >
                      {formik.values.learningTrackSections.map((lts, index) => (
                        <ContentDisclosure
                          key={`create-section-form-${index}`}
                          title={
                            lts.part && lts.title?.nameEn
                              ? `${lts.part}: ${lts.title.nameEn}`
                              : `${`Section ${index + 1}`}`
                          }
                          defaultOpen={lts.id === undefined}
                        >
                          <LearningTrackSectionForm
                            key={index}
                            formik={formik}
                            index={index}
                            onRemoveLearningTrackSection={
                              onRemoveLearningTrackSection
                            }
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
                            onClick={onAddLearningTrackSection}
                          >
                            Add another section
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
                    Save learning track
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

export default LearningTrackDetailPage;
