import 'react-quill/dist/quill.snow.css';

import { centralHttp } from '../http';
import { enumToArray } from '../utils/array';
import API_PATHS from '../constants/apiPaths';
import InputSelect from '../ui-kit/InputSelect';
import LangInputSection from '../ui-kit/LangInputSection';
import ReactQuillWithLang from '../ui-kit/ReactQuillWithLang';
import useTranslation from '../i18n/useTranslation';
import useMultiAsyncInput from '../hooks/useMultiAsyncInput';
import { CourseLanguage, CourseStatus, ICourse } from '../models/course';
import InputFile from '../ui-kit/InputFile';
import useAsyncInput from '../hooks/useAsyncInput';
import { useImageUpload } from './useImageUpload';
import { CourseDuration } from './CourseDuration';
import { Language } from '../models/language';
import { useEffect, useState } from 'react';
import { CourseRuleType, ICourseRule } from '../models/course-rule';
import { BaseResponseDto } from '../models/BaseResponse.dto';
import { TagList } from './TagList';
import WEB_PATHS from '../constants/webPaths';

const CourseForm = ({
  formik,
  setCategoryKey,
  courseMain,
}: {
  formik: any;
  setCategoryKey: (arg: string) => void;
  courseMain?: ICourse<Language>;
}) => {
  const { t } = useTranslation();
  const { imagePreview, imageError, handleImageChange } = useImageUpload(
    courseMain?.imageKey,
  );
  const {
    getOptions: getTagOptions,
    inputValues: tagInputValues,
    onValueChange: onTagsValueChange,
  } = useMultiAsyncInput({
    http: centralHttp.get,
    apiPath: API_PATHS.TAGS,
    formikFieldValue: formik.values.tagIds,
    initialSelectedOptions: courseMain?.tags,
  });
  const {
    getOptions: getTopicOptions,
    inputValues: topicInputValues,
    onValueChange: onTopicsValueChange,
  } = useMultiAsyncInput({
    http: centralHttp.get,
    apiPath: API_PATHS.TOPICS,
    formikFieldValue: formik.values.topicIds,
    initialSelectedOptions: courseMain?.topics,
  });
  const {
    getOptions: getMaterialOptions,
    inputValues: materialInputValues,
    onValueChange: onMaterialsValueChange,
  } = useMultiAsyncInput({
    http: centralHttp.get,
    fieldName: 'displayName',
    apiPath: API_PATHS.MATERIALS,
    formikFieldValue: formik.values.materialIds,
    initialSelectedOptions: courseMain?.materials,
  });
  const {
    getOptions: getCategoryOptions,
    inputValue: categoryInputValue,
    options: categories,
  } = useAsyncInput({
    allowSearch: false,
    http: centralHttp.get,
    apiPath: API_PATHS.COURSE_CATEGORIES,
    formikFieldValue: formik.values.categoryId,
  });
  const publicStatuses = [
    {
      label: 'Yes',
      value: true,
    },
    {
      label: 'No',
      value: false,
    },
  ];

  const handleFileChange = (files: FileList, key: string, callback: any) => {
    handleImageChange(files, key, (file) => {
      if (file) {
        formik.setFieldValue(key, file);
      } else {
        formik.setFieldValue(key, null);
        callback(false);
      }
    });
  };

  const [relatedPrereqRules, setRelatedPrereqRules] = useState<ICourseRule[]>(
    [],
  );
  const [relatedPreAssessmentRules, setRelatedPreAssessmentRules] = useState<
    ICourseRule[]
  >([]);

  useEffect(() => {
    const getRelatedRules = async () => {
      try {
        const res = await centralHttp.get<BaseResponseDto<ICourseRule[]>>(
          API_PATHS.COURSE_RULES_COURSE_OUTLINES,
          {
            params: {
              ids: courseMain.courseOutlines.map((outline) => outline.id),
              types: [CourseRuleType.PRE_ASSESSMENT, CourseRuleType.REQUIRED],
            },
          },
        );
        setRelatedPrereqRules(
          res.data.data.filter((rule) =>
            rule.courseRuleItems.some(
              (item) => item.type === CourseRuleType.REQUIRED,
            ),
          ),
        );
        setRelatedPreAssessmentRules(
          res.data.data.filter((rule) =>
            rule.courseRuleItems.some(
              (item) => item.type === CourseRuleType.PRE_ASSESSMENT,
            ),
          ),
        );
      } catch (err) {
        //
      }
    };

    if (courseMain?.id) {
      getRelatedRules();
    }
  }, [courseMain?.id]);

  return (
    <div>
      {relatedPrereqRules?.length > 0 && (
        <TagList
          title="Related Prerequisite Course Rules"
          tags={relatedPrereqRules.map((rule) => ({
            title: rule.name,
            url: `${WEB_PATHS.COURSE_RULE_DETAIL.replace(':id', rule.id)}`,
          }))}
        />
      )}
      {relatedPreAssessmentRules?.length > 0 && (
        <TagList
          title="Related Pre-assessment Course Rules"
          tags={relatedPreAssessmentRules.map((rule) => ({
            title: rule.name,
            url: `${WEB_PATHS.COURSE_RULE_DETAIL.replace(':id', rule.id)}`,
          }))}
        />
      )}
      <LangInputSection
        formik={formik}
        labelEn={t('courseForm.title') + ' (EN) *'}
        labelTh={t('courseForm.title') + ' (TH)'}
        name="title"
        placeholder={t('courseForm.title')}
        inputWrapperClassName="mb-3"
        onBlur={formik.handleBlur}
        value={formik.values.title}
        onChange={formik.handleChange}
        formikTouched={formik.touched.title}
        formikErrors={formik.errors.title}
      />
      <LangInputSection
        formik={formik}
        labelEn={t('courseForm.tagLine') + ' (EN)'}
        labelTh={t('courseForm.tagLine') + ' (TH)'}
        name="tagLine"
        placeholder={t('courseForm.tagLine')}
        inputWrapperClassName="mb-3"
        onBlur={formik.handleBlur}
        value={formik.values.tagLine}
        onChange={formik.handleChange}
        formikTouched={formik.touched.tagLine}
        formikErrors={formik.errors.tagLine}
      />
      <InputSelect
        name="categoryId"
        formik={formik}
        label={t('courseForm.category') + ' *'}
        value={{
          label: categoryInputValue.label || t('courseForm.pleaseSelect'),
          value: categoryInputValue.value,
        }}
        isAsync={true}
        promiseOptions={getCategoryOptions}
        placeholder={t('courseForm.pleaseSelect')}
        onBlur={formik.handleBlur}
        selectClassWrapperName="mb-3"
        isDisabled={!!courseMain}
        onChange={(e) => {
          if (!courseMain) {
            formik.handleChange(e);
            setCategoryKey(
              categories.find((item) => item.id === e.target.value)?.key || '',
            );
          }
        }}
        error={formik.touched.categoryId && formik.errors.categoryId}
      />
      <CourseDuration
        fieldMinutes={formik.getFieldProps('durationMinutes')}
        fieldHours={formik.getFieldProps('durationHours')}
        fieldDays={formik.getFieldProps('durationDays')}
        fieldWeeks={formik.getFieldProps('durationWeeks')}
        fieldMonths={formik.getFieldProps('durationMonths')}
      />
      <InputSelect
        name="availableLanguage"
        formik={formik}
        label={t('courseForm.availableLanguage') + ' *'}
        options={enumToArray(CourseLanguage)}
        value={{
          label: enumToArray(CourseLanguage).find(
            (item) => item === formik.values.availableLanguage,
          )
            ? enumToArray(CourseLanguage).find(
                (item) => item === formik.values.availableLanguage,
              )
            : t('courseForm.pleaseSelect'),
          value: formik.values.availableLanguage,
        }}
        placeholder={t('courseForm.pleaseSelect')}
        onBlur={formik.handleBlur}
        selectClassWrapperName="w-100 mb-3"
        onChange={formik.handleChange}
        error={
          formik.touched.availableLanguage && formik.errors.availableLanguage
        }
      />
      <InputSelect
        name="tagIds"
        formik={formik}
        label={t('courseForm.tag')}
        value={tagInputValues}
        promiseOptions={getTagOptions}
        placeholder={t('courseForm.pleaseSelect')}
        onBlur={formik.handleBlur}
        selectClassWrapperName="mb-3"
        onChange={(e) => {
          onTagsValueChange(e.target.value);
          formik.handleChange(e);
        }}
        isMulti={true}
        isAsync={true}
        isSearchable={true}
      />
      <InputSelect
        name="topicIds"
        formik={formik}
        label={t('courseForm.topic') + ' *'}
        value={topicInputValues}
        isAsync={true}
        isMulti={true}
        isSearchable={true}
        promiseOptions={getTopicOptions}
        placeholder={t('courseForm.pleaseSelect')}
        onBlur={formik.handleBlur}
        selectClassWrapperName="mb-3"
        onChange={(e) => {
          onTopicsValueChange(e.target.value);
          formik.handleChange(e);
        }}
        error={formik.touched.topicIds && formik.errors.topicIds}
      />
      <InputSelect
        name="isPublic"
        formik={formik}
        label={t('courseForm.isPublicCourse')}
        options={publicStatuses.map((item) => item.value)}
        renderOptions={publicStatuses}
        value={{
          label: publicStatuses.find(
            (item) => item.value === formik.values.isPublic,
          )
            ? publicStatuses.find(
                (item) => item.value === formik.values.isPublic,
              ).label
            : t('courseForm.pleaseSelect'),
          value: formik.values.isPublic,
        }}
        placeholder={t('courseForm.pleaseSelect')}
        onBlur={formik.handleBlur}
        selectClassWrapperName="w-100 mb-3"
        onChange={formik.handleChange}
        error={formik.touched.isPublic && formik.errors.isPublic}
      />
      <InputSelect
        name="status"
        formik={formik}
        label={t('courseForm.status') + ' *'}
        options={enumToArray(CourseStatus)}
        value={{
          label: enumToArray(CourseStatus).find(
            (item) => item === formik.values.status,
          )
            ? enumToArray(CourseStatus).find(
                (item) => item === formik.values.status,
              )
            : t('courseForm.pleaseSelect'),
          value: formik.values.status,
        }}
        placeholder={t('courseForm.pleaseSelect')}
        onBlur={formik.handleBlur}
        selectClassWrapperName="w-100 mb-3"
        onChange={formik.handleChange}
        error={formik.touched.status && formik.errors.status}
      />
      <InputSelect
        name="materialIds"
        formik={formik}
        label={t('courseForm.material')}
        value={materialInputValues}
        isAsync={true}
        isMulti={true}
        isSearchable={true}
        promiseOptions={getMaterialOptions}
        placeholder={t('courseForm.pleaseSelect')}
        onBlur={formik.handleBlur}
        selectClassWrapperName="mb-3"
        onChange={(e) => {
          onMaterialsValueChange(e.target.value);
          formik.handleChange(e);
        }}
        error={formik.touched.materialIds && formik.errors.materialIds}
      />
      <div className="mb-3 flex">
        <div className="mr-3 flex flex-col text-left">
          <label className="mb-2 text-caption font-bold">
            {t('courseForm.courseImage')}
          </label>
          <div className="flex flex-1 flex-col">
            {imagePreview ? (
              <div className="border-1 my-auto border-gray-100">
                <img
                  className="object-cover"
                  src={imagePreview}
                  style={{ width: '328px', height: '328px' }}
                />
              </div>
            ) : null}
            <InputFile
              name="image"
              inputWrapperClassName="pt-3 mt-auto"
              allowedExtensions={['image/png', 'image/gif', 'image/jpeg']}
              error={imageError}
              onChange={(files, callback) =>
                handleFileChange(files, 'imageFile', callback)
              }
            />
          </div>
        </div>
      </div>
      <ReactQuillWithLang
        labelEn={t('courseForm.description') + ' (EN)'}
        labelTh={t('courseForm.description') + ' (TH)'}
        name="description"
        value={formik.values.description}
        formik={formik}
      />
      <hr className="my-6" />
      <ReactQuillWithLang
        labelEn={t('courseForm.learningObjective') + ' (EN)'}
        labelTh={t('courseForm.learningObjective') + ' (TH)'}
        name="learningObjective"
        value={formik.values.learningObjective}
        formik={formik}
      />
      <hr className="my-6" />
      <ReactQuillWithLang
        labelEn={t('courseForm.courseTarget') + ' (EN)'}
        labelTh={t('courseForm.courseTarget') + ' (TH)'}
        name="courseTarget"
        value={formik.values.courseTarget}
        formik={formik}
      />
    </div>
  );
};

export default CourseForm;
