import 'react-quill/dist/quill.snow.css';

import { centralHttp } from '../../http';
import InputFile from '../../ui-kit/InputFile';
import { enumToArray } from '../../utils/array';
import API_PATHS from '../../constants/apiPaths';
import { Language } from '../../models/language';
import { useImageUpload } from './useImageUpload';
import InputSelect from '../../ui-kit/InputSelect';
import { CourseStatus } from '../../models/course';
import useAsyncInput from '../../hooks/useAsyncInput';
import useTranslation from '../../i18n/useTranslation';
import { ILearningTrack } from '../../models/learningTrack';
import LangInputSection from '../../ui-kit/LangInputSection';
import useMultiAsyncInput from '../../hooks/useMultiAsyncInput';
import { LearningTrackDuration } from './LearningTrackDuration';
import ReactQuillWithLang from '../../ui-kit/ReactQuillWithLang';

const LearningTrackForm = ({
  formik,
  learningTrackMain,
}: {
  formik: any;
  learningTrackMain?: ILearningTrack<Language>;
}) => {
  const { t } = useTranslation();
  const { imagePreview, imageError, handleImageChange } = useImageUpload(
    learningTrackMain?.imageKey,
  );
  const {
    getOptions: getTagOptions,
    inputValues: tagInputValues,
    onValueChange: onTagsValueChange,
  } = useMultiAsyncInput({
    http: centralHttp.get,
    apiPath: API_PATHS.TAGS,
    formikFieldValue: formik.values.tagIds,
    initialSelectedOptions: learningTrackMain?.tags,
  });
  const {
    getOptions: getTopicOptions,
    inputValues: topicInputValues,
    onValueChange: onTopicsValueChange,
  } = useMultiAsyncInput({
    http: centralHttp.get,
    apiPath: API_PATHS.TOPICS,
    formikFieldValue: formik.values.topicIds,
    initialSelectedOptions: learningTrackMain?.topics,
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
    initialSelectedOptions: learningTrackMain?.materials,
  });
  const { getOptions: getCategoryOptions, inputValue: categoryInputValue } =
    useAsyncInput({
      allowSearch: false,
      http: centralHttp.get,
      apiPath: API_PATHS.COURSE_CATEGORIES,
      formikFieldValue: formik.values.categoryId,
    });

  const yesNoLabel = [
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

  return (
    <div>
      <LangInputSection
        formik={formik}
        labelEn={t('learningTrackForm.title') + ' (EN) *'}
        labelTh={t('learningTrackForm.title') + ' (TH)'}
        name="title"
        placeholder={t('learningTrackForm.title')}
        inputWrapperClassName="mb-3"
        onBlur={formik.handleBlur}
        value={formik.values.title}
        onChange={formik.handleChange}
        formikTouched={formik.touched.title}
        formikErrors={formik.errors.title}
      />
      <LangInputSection
        formik={formik}
        labelEn={t('learningTrackForm.tagLine') + ' (EN)'}
        labelTh={t('learningTrackForm.tagLine') + ' (TH)'}
        name="tagLine"
        placeholder={t('learningTrackForm.tagLine')}
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
        label={t('learningTrackForm.category') + ' *'}
        value={{
          label:
            categoryInputValue.label || t('learningTrackForm.pleaseSelect'),
          value: categoryInputValue.value,
        }}
        isAsync={true}
        promiseOptions={getCategoryOptions}
        placeholder={t('learningTrackForm.pleaseSelect')}
        onBlur={formik.handleBlur}
        selectClassWrapperName="mb-3"
        onChange={(e) => {
          formik.handleChange(e);
        }}
        error={formik.touched.categoryId && formik.errors.categoryId}
      />
      <LearningTrackDuration
        fieldMinutes={formik.getFieldProps('durationMinutes')}
        fieldHours={formik.getFieldProps('durationHours')}
        fieldDays={formik.getFieldProps('durationDays')}
        fieldWeeks={formik.getFieldProps('durationWeeks')}
        fieldMonths={formik.getFieldProps('durationMonths')}
      />
      <InputSelect
        name="tagIds"
        formik={formik}
        label={t('learningTrackForm.tag')}
        value={tagInputValues}
        promiseOptions={getTagOptions}
        placeholder={t('learningTrackForm.pleaseSelect')}
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
        label={t('learningTrackForm.topic') + ' *'}
        value={topicInputValues}
        isAsync={true}
        isMulti={true}
        isSearchable={true}
        promiseOptions={getTopicOptions}
        placeholder={t('learningTrackForm.pleaseSelect')}
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
        label={t('learningTrackForm.isPublic')}
        options={yesNoLabel.map((item) => item.value)}
        renderOptions={yesNoLabel}
        value={{
          label: yesNoLabel.find(
            (item) => item.value === formik.values.isPublic,
          )
            ? yesNoLabel.find((item) => item.value === formik.values.isPublic)
                .label
            : t('learningTrackForm.pleaseSelect'),
          value: formik.values.isPublic,
        }}
        placeholder={t('learningTrackForm.pleaseSelect')}
        onBlur={formik.handleBlur}
        selectClassWrapperName="w-100 mb-3"
        onChange={formik.handleChange}
        error={formik.touched.isPublic && formik.errors.isPublic}
      />
      <InputSelect
        name="isFeatured"
        formik={formik}
        label={t('learningTrackForm.isFeatured')}
        options={yesNoLabel.map((item) => item.value)}
        renderOptions={yesNoLabel}
        value={{
          label: yesNoLabel.find(
            (item) => item.value === formik.values.isFeatured,
          )
            ? yesNoLabel.find((item) => item.value === formik.values.isFeatured)
                .label
            : t('learningTrackForm.pleaseSelect'),
          value: formik.values.isFeatured,
        }}
        placeholder={t('learningTrackForm.pleaseSelect')}
        onBlur={formik.handleBlur}
        selectClassWrapperName="w-100 mb-3"
        onChange={formik.handleChange}
        error={formik.touched.isFeatured && formik.errors.isFeatured}
      />
      <InputSelect
        name="status"
        formik={formik}
        label={t('learningTrackForm.status') + ' *'}
        options={enumToArray(CourseStatus)}
        value={{
          label: enumToArray(CourseStatus).find(
            (item) => item === formik.values.status,
          )
            ? enumToArray(CourseStatus).find(
                (item) => item === formik.values.status,
              )
            : t('learningTrackForm.pleaseSelect'),
          value: formik.values.status,
        }}
        placeholder={t('learningTrackForm.pleaseSelect')}
        onBlur={formik.handleBlur}
        selectClassWrapperName="w-100 mb-3"
        onChange={formik.handleChange}
        error={formik.touched.status && formik.errors.status}
      />
      <InputSelect
        name="materialIds"
        formik={formik}
        label={t('learningTrackForm.material')}
        value={materialInputValues}
        isAsync={true}
        isMulti={true}
        isSearchable={true}
        promiseOptions={getMaterialOptions}
        placeholder={t('learningTrackForm.pleaseSelect')}
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
            {t('learningTrackForm.learningTrackImage')}
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
        labelEn={t('learningTrackForm.description') + ' (EN)'}
        labelTh={t('learningTrackForm.description') + ' (TH)'}
        name="description"
        value={formik.values.description}
        formik={formik}
      />
      <hr className="my-6" />
      <ReactQuillWithLang
        labelEn={t('learningTrackForm.learningObjective') + ' (EN)'}
        labelTh={t('learningTrackForm.learningObjective') + ' (TH)'}
        name="learningObjective"
        value={formik.values.learningObjective}
        formik={formik}
      />
      <hr className="my-6" />
      <ReactQuillWithLang
        labelEn={t('learningTrackForm.learningTrackTarget') + ' (EN)'}
        labelTh={t('learningTrackForm.learningTrackTarget') + ' (TH)'}
        name="learningTrackTarget"
        value={formik.values.learningTrackTarget}
        formik={formik}
      />
    </div>
  );
};

export default LearningTrackForm;
