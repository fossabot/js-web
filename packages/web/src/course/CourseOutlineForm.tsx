import { FormikProps, getIn } from 'formik';
import React, { useEffect, useMemo, useState } from 'react';
import { FaPlus, FaTrash } from 'react-icons/fa';

import 'react-datepicker/dist/react-datepicker.css';

import { centralHttp, paymentHttp } from '../http';
import Button from '../ui-kit/Button';
import API_PATHS from '../constants/apiPaths';
import InputSelect from '../ui-kit/InputSelect';
import InputSection from '../ui-kit/InputSection';
import LangInputSection from '../ui-kit/LangInputSection';
import ReactQuillWithLang from '../ui-kit/ReactQuillWithLang';
import CourseScormUpload from './CourseScormUpload';
import useAsyncInput from '../hooks/useAsyncInput';
import useTranslation from '../i18n/useTranslation';
import {
  CourseCategoryKey,
  CourseSubCategoryKey,
  ICourse,
  ICourseOutline,
  ICourseSession,
  PartialCourseOutlineBundle,
} from '../models/course';
import CourseSessionForm from './CourseSessionForm';
import { CourseOutlinePlaylist } from './CourseOutlinePlaylist';
import { CourseDuration } from './CourseDuration';
import { Language } from '../models/language';
import { ContentDisclosure } from '../ui-kit/ContentDisclosure';
import { dateToUTCDate, formatWithTimezone } from '../utils/date';
import { DATE_TIME_FORMAT_SHORT } from '../constants/datetime';
import {
  getCourseOutlineNamePrefix,
  getCourseSessionInitialData,
  setCourseOutlineForm,
} from './utils';
import { isBefore } from 'date-fns';
import { SubscriptionPlan } from '../models/subscriptionPlan';
import { TagList } from './TagList';
import _ from 'lodash';
import WEB_PATHS from '../constants/webPaths';
import InputCheckbox from '../ui-kit/InputCheckbox';
import { CourseRuleType, ICourseRule } from '../models/course-rule';
import { BaseResponseDto } from '../models/BaseResponse.dto';

const CourseOutlineForm = ({
  formik,
  index,
  categoryKey,
  courseOutlineMain,
  onRemoveCourseOutline,
}: {
  formik: FormikProps<ICourse<Language>>;
  index: number;
  categoryKey?: string;
  courseOutlineMain?: ICourseOutline<Language>;
  onRemoveCourseOutline: (arg: number) => void;
}) => {
  const courseOutline = formik.values.courseOutlines[index];
  const courseOutlineNamePrefix = getCourseOutlineNamePrefix(index);

  const { t } = useTranslation();
  const [subCategoryKey, setSubCategoryKey] = useState(
    courseOutlineMain?.category?.key || '',
  );

  const {
    getOptions: getOrganizationOptions,
    inputValue: organizationInputValue,
  } = useAsyncInput({
    http: centralHttp.get,
    apiPath: API_PATHS.ORGANIZATIONS,
    formikFieldValue: courseOutline.organizationId,
  });
  const {
    getOptions: getLearningWayOptions,
    inputValue: learningWayInputValue,
  } = useAsyncInput({
    allowSearch: false,
    http: centralHttp.get,
    apiPath: API_PATHS.LEARNING_WAYS,
    formikFieldValue: courseOutline.learningWayId,
  });
  const {
    getOptions: getSubCategoryOptions,
    inputValue: subCategoryInputValue,
    options: subCategories,
  } = useAsyncInput({
    allowSearch: false,
    http: centralHttp.get,
    apiPath: API_PATHS.COURSE_SUB_CATEGORIES,
    formikFieldValue: courseOutline.categoryId,
    filterOptionsFunc: (d) => d.courseCategory.key === categoryKey,
  });

  useEffect(() => {
    if (!courseOutlineMain) {
      const subCategory = subCategories.find(
        (sc) => sc.courseCategory.key === categoryKey,
      );
      formik.setFieldValue(
        `${courseOutlineNamePrefix}.categoryId`,
        subCategory?.id || '',
      );
      formik.setFieldValue(
        `${courseOutlineNamePrefix}.outlineType`,
        subCategory?.key || '',
      );
      setSubCategoryKey(subCategory?.key || '');
    }
  }, [categoryKey, courseOutlineMain]);

  // TODO: Find better way to manage this.
  useEffect(() => {
    setCourseOutlineForm(formik, index, courseOutlineMain, subCategoryKey);
  }, [subCategoryKey]);

  const onAddCourseSession = () => {
    formik.setFieldValue(`${courseOutlineNamePrefix}.courseSessions`, [
      ...courseOutline.courseSessions,
      getCourseSessionInitialData(),
    ]);
  };

  const onRemoveCourseSession = (i) => {
    if (courseOutline.courseSessions.length > 1) {
      const arr = [...courseOutline.courseSessions];
      arr.splice(i, 1);

      formik.setFieldValue(`${courseOutlineNamePrefix}.courseSessions`, arr);
    }
  };

  const sessionTitles = useMemo(() => {
    const titles: Record<string, string> = {};

    courseOutline?.courseSessions?.forEach((session, sessionIndex) => {
      const startDate = formatWithTimezone(
        dateToUTCDate(session.startDateTime),
        DATE_TIME_FORMAT_SHORT,
      );
      const endDate = formatWithTimezone(
        dateToUTCDate(session.endDateTime),
        DATE_TIME_FORMAT_SHORT,
      );

      const key = `session-${index}-${sessionIndex}`; // index is course index supplied from props.
      if (startDate && endDate) titles[key] = `${startDate} - ${endDate}`;
      else titles[key] = `Session ${sessionIndex + 1}`;
    });

    return titles;
  }, [courseOutline.courseSessions]);

  const isPastSessionAndHasId = (session: ICourseSession, refTime: Date) => {
    return isBefore(new Date(session.endDateTime), refTime) && session.id;
  };

  const [hasPastSessions, setHasPastSessions] = useState<boolean>(false);

  const now = new Date();
  useEffect(() => {
    if (!courseOutline?.courseSessions) return null;

    setHasPastSessions(
      courseOutline.courseSessions.some((s) => isPastSessionAndHasId(s, now)),
    );
  }, [courseOutline?.courseSessions]);

  const [relatedPlans, setRelatedPlans] =
    useState<SubscriptionPlan[] | undefined>();
  const [relatedBundleNames, setRelatedBundleNames] =
    useState<string[] | undefined>();
  const [relatedRules, setRelatedRules] = useState<ICourseRule[]>([]);

  useEffect(() => {
    const getPlansWithBundles = async () => {
      const plans = await paymentHttp.get<{ data: SubscriptionPlan[] }>(
        API_PATHS.ALL_PLANS,
        {
          params: { courseOutlineId: courseOutline.id },
        },
      );

      setRelatedPlans(_.uniqBy(plans.data.data, (plan) => plan.id));

      const bundles = plans.data.data.reduce((prev, current) => {
        if (current.courseOutlineBundle)
          prev = [
            ...prev,
            ...current.courseOutlineBundle.map((bundle) => bundle),
          ];

        return prev;
      }, [] as PartialCourseOutlineBundle[]);

      setRelatedBundleNames(_.uniqBy(bundles, (b) => b.id).map((b) => b.name));
    };

    const getRelatedRules = async (courseOutlineId: string) => {
      try {
        const res = await centralHttp.get<BaseResponseDto<ICourseRule[]>>(
          API_PATHS.COURSE_RULES_COURSE_OUTLINES,
          {
            params: {
              ids: [courseOutlineId],
              types: [CourseRuleType.BOOK],
            },
          },
        );
        setRelatedRules(res.data.data);
      } catch (err) {
        //
      }
    };

    if (courseOutline?.id) {
      getPlansWithBundles();
      getRelatedRules(courseOutline.id);
    }
  }, [courseOutline?.id]);

  return (
    <div className="mb-6 w-full rounded border border-gray-400 bg-gray-100 p-4 shadow-sm">
      {formik.values.courseOutlines.length > 1 ? (
        <div className="flex w-full flex-col items-end justify-end">
          <div className="mb-3 w-1/4 text-right">
            <Button
              iconLeft={
                <FaTrash
                  className="text-grey-400 mr-2 h-5 w-5"
                  aria-hidden="true"
                />
              }
              size="medium"
              variant="secondary"
              type="button"
              className="items-end"
              onClick={() => onRemoveCourseOutline(index)}
            >
              Remove course outline
            </Button>
          </div>
        </div>
      ) : null}
      {relatedPlans?.length > 0 && (
        <TagList
          title="Related Plans"
          tags={relatedPlans.map((plan) => ({
            title: plan.name,
            url: `${WEB_PATHS.PLAN_COURSE_BUNDLE}?search=${encodeURIComponent(
              plan.name,
            )}&searchField=name`,
          }))}
        />
      )}
      {relatedBundleNames?.length > 0 && (
        <TagList
          title="Related Bundles"
          tags={relatedBundleNames.map((bundle) => ({
            title: bundle,
            url: `${
              WEB_PATHS.COURSE_OUTLINE_BUNDLE
            }?search=${encodeURIComponent(bundle)}&searchField=name`,
          }))}
        />
      )}
      {relatedRules?.length > 0 && (
        <TagList
          title="Related Pre-booking Course Rules"
          tags={relatedRules.map((rule) => ({
            title: rule.name,
            url: `${WEB_PATHS.COURSE_RULE_DETAIL.replace(':id', rule.id)}`,
          }))}
        />
      )}
      {courseOutline.id ? (
        <InputSection
          label="ID"
          placeholder={'ID'}
          name="course outline id"
          inputWrapperClassName="mb-3"
          value={courseOutline.id}
          disabled
        />
      ) : null}

      <InputSection
        formik={formik}
        label={t('courseOutlineForm.part') + ' *'}
        type="number"
        min={1}
        name={`${courseOutlineNamePrefix}.part`}
        placeholder={t('courseOutlineForm.part')}
        inputWrapperClassName="mb-3"
        value={courseOutline?.part}
        onBlur={formik.handleBlur}
        onChange={formik.handleChange}
        error={getIn(formik.errors, `${courseOutlineNamePrefix}.part`)}
      />

      <LangInputSection
        formik={formik}
        labelEn={t('courseOutlineForm.title') + ' (EN) *'}
        labelTh={t('courseOutlineForm.title') + ' (TH)'}
        name={`${courseOutlineNamePrefix}.title`}
        placeholder={t('courseOutlineForm.title')}
        inputWrapperClassName="mb-3"
        onBlur={formik.handleBlur}
        value={courseOutline?.title}
        onChange={formik.handleChange}
        formikTouched={getIn(
          formik.touched,
          `${courseOutlineNamePrefix}.title`,
        )}
        formikErrors={getIn(formik.errors, `${courseOutlineNamePrefix}.title`)}
      />
      <InputSection
        formik={formik}
        label={t('courseOutlineForm.courseCode') + ' *'}
        name={`${courseOutlineNamePrefix}.courseCode`}
        placeholder={t('courseOutlineForm.courseCode')}
        inputWrapperClassName="mb-3"
        onBlur={formik.handleBlur}
        value={courseOutline?.courseCode}
        onChange={formik.handleChange}
        error={
          getIn(formik.touched, `${courseOutlineNamePrefix}.courseCode`) &&
          getIn(formik.errors, `${courseOutlineNamePrefix}.courseCode`)
        }
      />
      <InputSelect
        name={`${courseOutlineNamePrefix}.categoryId`}
        formik={formik}
        label={t('courseOutlineForm.subCategory') + ' *'}
        value={{
          label:
            subCategoryInputValue.label || t('courseOutlineForm.pleaseSelect'),
          value: subCategoryInputValue.value,
        }}
        isAsync={true}
        key={`${courseOutlineNamePrefix}.categoryId-${categoryKey}`}
        promiseOptions={getSubCategoryOptions}
        placeholder={t('courseOutlineForm.pleaseSelect')}
        onBlur={formik.handleBlur}
        selectClassWrapperName="mb-3"
        onChange={(e) => {
          formik.handleChange(e);
          setSubCategoryKey(
            subCategories.find((sc) => sc.id === e.target.value)?.key || '',
          );
        }}
        error={
          getIn(formik.touched, `${courseOutlineNamePrefix}.categoryId`) &&
          getIn(formik.errors, `${courseOutlineNamePrefix}.categoryId`)
        }
      />
      <InputSelect
        name={`${courseOutlineNamePrefix}.learningWayId`}
        formik={formik}
        label={t('courseOutlineForm.learningWay') + ' *'}
        value={{
          label:
            learningWayInputValue?.label || t('courseOutlineForm.pleaseSelect'),
          value: learningWayInputValue?.value,
        }}
        isAsync={true}
        promiseOptions={getLearningWayOptions}
        placeholder={t('courseOutlineForm.pleaseSelect')}
        onBlur={formik.handleBlur}
        selectClassWrapperName="mb-3"
        onChange={formik.handleChange}
        error={
          getIn(formik.touched, `${courseOutlineNamePrefix}.learningWayId`) &&
          getIn(formik.errors, `${courseOutlineNamePrefix}.learningWayId`)
        }
      />
      <CourseDuration
        fieldMinutes={formik.getFieldProps(
          `${courseOutlineNamePrefix}.durationMinutes`,
        )}
        fieldHours={formik.getFieldProps(
          `${courseOutlineNamePrefix}.durationHours`,
        )}
        fieldDays={formik.getFieldProps(
          `${courseOutlineNamePrefix}.durationDays`,
        )}
        fieldWeeks={formik.getFieldProps(
          `${courseOutlineNamePrefix}.durationWeeks`,
        )}
        fieldMonths={formik.getFieldProps(
          `${courseOutlineNamePrefix}.durationMonths`,
        )}
      />
      <ReactQuillWithLang
        labelEn={t('courseOutlineForm.description') + ' (EN)'}
        labelTh={t('courseOutlineForm.description') + ' (TH)'}
        name={`${courseOutlineNamePrefix}.description`}
        value={courseOutline?.description}
        formik={formik}
      />

      {subCategoryKey === CourseSubCategoryKey.LINK ? (
        <div className="pb-1rounded-md m-3 px-6 pt-6 text-left">
          <div className="mb-3 text-subheading font-bold">
            External link fields
          </div>
          <div className="mb-6 w-full rounded border border-gray-400 bg-gray-100 p-4 shadow-sm">
            <InputSelect
              name={`${courseOutlineNamePrefix}.organizationId`}
              formik={formik}
              label={t('courseOutlineForm.organization') + ' *'}
              value={{
                label:
                  organizationInputValue?.label ||
                  t('courseOutlineForm.pleaseSelect'),
                value: organizationInputValue?.value,
              }}
              promiseOptions={getOrganizationOptions}
              placeholder={t('courseOutlineForm.pleaseSelect')}
              onBlur={formik.handleBlur}
              selectClassWrapperName="mb-3"
              onChange={formik.handleChange}
              isAsync={true}
              isSearchable={true}
            />
            <InputSection
              formik={formik}
              label={t('courseOutlineForm.providerName')}
              name={`${courseOutlineNamePrefix}.providerName`}
              placeholder={t('courseOutlineForm.providerName')}
              inputWrapperClassName="mb-3"
              onBlur={formik.handleBlur}
              value={courseOutline?.providerName}
              onChange={formik.handleChange}
            />
            <InputSection
              formik={formik}
              label={t('courseOutlineForm.thirdPartyPlatformUrl') + ' *'}
              name={`${courseOutlineNamePrefix}.thirdPartyPlatformUrl`}
              placeholder={t('courseOutlineForm.thirdPartyPlatformUrl')}
              inputWrapperClassName="mb-3"
              onBlur={formik.handleBlur}
              value={courseOutline?.thirdPartyPlatformUrl}
              onChange={formik.handleChange}
            />
            <InputSection
              formik={formik}
              label={t('courseOutlineForm.thirdPartyCourseCode') + ' *'}
              name={`${courseOutlineNamePrefix}.thirdPartyCourseCode`}
              placeholder={t('courseOutlineForm.thirdPartyCourseCode')}
              inputWrapperClassName="mb-3"
              onBlur={formik.handleBlur}
              value={courseOutline?.thirdPartyCourseCode}
              onChange={formik.handleChange}
            />
          </div>
        </div>
      ) : null}

      {subCategoryKey === CourseSubCategoryKey.SCORM ? (
        <div className="pb-1rounded-md m-3 px-6 pt-6 text-left">
          <div className="mb-3 text-subheading font-bold">SCORM Content</div>
          <CourseScormUpload
            formik={formik}
            courseOutlineNamePrefix={courseOutlineNamePrefix}
            courseOutline={courseOutline}
          />
        </div>
      ) : null}

      {categoryKey === CourseCategoryKey.LEARNING_EVENT && !!subCategoryKey ? (
        <div className="m-3 rounded-md px-6 pt-6 pb-1 text-left">
          <div className="mb-3 text-subheading font-bold">Course sessions</div>
          {hasPastSessions && (
            <div className="mb-5">
              <ContentDisclosure title="Archived sessions" defaultOpen={false}>
                {courseOutline?.courseSessions.map((cs, csIdx) => {
                  if (!isPastSessionAndHasId(cs, now)) return null;
                  return (
                    <ContentDisclosure
                      key={csIdx}
                      title={sessionTitles[`session-${index}-${csIdx}`]}
                      defaultOpen={cs.id === undefined}
                    >
                      <CourseSessionForm
                        index={csIdx}
                        formik={formik}
                        courseOutline={courseOutline}
                        onRemoveCourseSession={onRemoveCourseSession}
                        courseOutlineNamePrefix={courseOutlineNamePrefix}
                      />
                    </ContentDisclosure>
                  );
                })}
              </ContentDisclosure>
            </div>
          )}
          {courseOutline?.courseSessions.map((cs, csIdx) => {
            if (isPastSessionAndHasId(cs, now)) return null;

            return (
              <ContentDisclosure
                key={csIdx}
                title={sessionTitles[`session-${index}-${csIdx}`]}
                defaultOpen={cs.id === undefined}
              >
                <CourseSessionForm
                  index={csIdx}
                  formik={formik}
                  courseOutline={courseOutline}
                  onRemoveCourseSession={onRemoveCourseSession}
                  courseOutlineNamePrefix={courseOutlineNamePrefix}
                />
              </ContentDisclosure>
            );
          })}
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
                onClick={onAddCourseSession}
              >
                Add another course session
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {subCategoryKey === CourseSubCategoryKey.VIDEO && (
        <>
          <div className="mb-2 text-left">
            <label className="text-caption font-bold">
              {t('courseOutlineForm.playlist')}
            </label>
          </div>
          <CourseOutlinePlaylist
            medias={
              formik.getFieldProps(`${courseOutlineNamePrefix}.mediaPlaylist`)
                .value || []
            }
            onChange={(medias) =>
              formik.setFieldValue(
                `${courseOutlineNamePrefix}.mediaPlaylist`,
                medias,
              )
            }
          />
        </>
      )}

      {subCategoryKey === CourseSubCategoryKey.ASSESSMENT && (
        <div className="pb-1rounded-md m-3 px-6 pt-6 text-left">
          <div className="mb-3 text-subheading font-bold">
            SEAC Assessment Center fields
          </div>
          <div className="mb-6 w-full rounded border border-gray-400 bg-gray-100 p-4 shadow-sm">
            <InputSection
              formik={formik}
              label={
                t('courseOutlineForm.assessmentAPIEndpoint') +
                ' * ' +
                `{Assessment Center URL}/${getIn(
                  formik.values,
                  `${courseOutlineNamePrefix}.assessmentAPIEndpoint`,
                )}`
              }
              name={`${courseOutlineNamePrefix}.assessmentAPIEndpoint`}
              placeholder={t('courseOutlineForm.assessmentAPIEndpoint')}
              inputWrapperClassName="mb-3"
              onBlur={formik.handleBlur}
              value={courseOutline?.assessmentAPIEndpoint}
              onChange={formik.handleChange}
              error={
                getIn(
                  formik.touched,
                  `${courseOutlineNamePrefix}.assessmentAPIEndpoint`,
                ) &&
                getIn(
                  formik.errors,
                  `${courseOutlineNamePrefix}.assessmentAPIEndpoint`,
                )
              }
            />
            <InputSection
              formik={formik}
              label={t('courseOutlineForm.assessmentName') + ' *'}
              name={`${courseOutlineNamePrefix}.assessmentName`}
              placeholder={t('courseOutlineForm.assessmentName')}
              inputWrapperClassName="mb-3"
              onBlur={formik.handleBlur}
              value={courseOutline?.assessmentName}
              onChange={formik.handleChange}
              error={
                getIn(
                  formik.touched,
                  `${courseOutlineNamePrefix}.assessmentName`,
                ) &&
                getIn(
                  formik.errors,
                  `${courseOutlineNamePrefix}.assessmentName`,
                )
              }
            />
            <InputCheckbox
              formik={formik}
              label={t('courseOutlineForm.assessmentNotifyEmailStatus')}
              name={`${courseOutlineNamePrefix}.assessmentNotifyEmailStatus`}
              inputWrapperClassName="mb-3"
              onBlur={formik.handleBlur}
              checked={courseOutline?.assessmentNotifyEmailStatus}
              onChange={formik.handleChange}
            />
            <InputCheckbox
              formik={formik}
              label={t('courseOutlineForm.assessmentUserCanRetest')}
              name={`${courseOutlineNamePrefix}.assessmentUserCanRetest`}
              inputWrapperClassName="mb-3"
              onBlur={formik.handleBlur}
              checked={courseOutline?.assessmentUserCanRetest}
              onChange={formik.handleChange}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseOutlineForm;
