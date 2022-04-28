import React from 'react';
import { FaTrash } from 'react-icons/fa';
import { FormikProps, getIn } from 'formik';

import Button from '../../ui-kit/Button';
import { Language } from '../../models/language';
import InputSection from '../../ui-kit/InputSection';
import useTranslation from '../../i18n/useTranslation';
import { ILearningTrack } from '../../models/learningTrack';
import LangInputSection from '../../ui-kit/LangInputSection';
import LearningTrackSectionCourseForm from './LearningTrackSectionCourseForm';

const LearningTrackSectionForm = ({
  formik,
  index,
  onRemoveLearningTrackSection,
}: {
  formik: FormikProps<ILearningTrack<Language>>;
  index: number;
  onRemoveLearningTrackSection: (arg: number) => void;
}) => {
  const learningTrackSection = formik.values.learningTrackSections[index];
  const learningTrackSectionNamePrefix = `learningTrackSections[${index}]`;

  const { t } = useTranslation();

  return (
    <div className="mb-6 w-full rounded border border-gray-400 bg-gray-100 p-4 shadow-sm">
      {formik.values.learningTrackSections.length > 1 ? (
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
              onClick={() => onRemoveLearningTrackSection(index)}
            >
              Remove section
            </Button>
          </div>
        </div>
      ) : null}

      {learningTrackSection.id ? (
        <InputSection
          label="ID"
          placeholder={'ID'}
          name="course outline id"
          inputWrapperClassName="mb-3"
          value={learningTrackSection.id}
          disabled
        />
      ) : null}

      <InputSection
        formik={formik}
        label={t('learningTrackSectionForm.part') + ' *'}
        type="number"
        min={1}
        name={`${learningTrackSectionNamePrefix}.part`}
        placeholder={t('learningTrackSectionForm.part')}
        inputWrapperClassName="mb-3"
        value={learningTrackSection?.part}
        onBlur={formik.handleBlur}
        onChange={formik.handleChange}
        error={
          getIn(formik.touched, `${learningTrackSectionNamePrefix}.part`) &&
          getIn(formik.errors, `${learningTrackSectionNamePrefix}.part`)
        }
      />

      <LangInputSection
        formik={formik}
        labelEn={t('learningTrackSectionForm.title') + ' (EN)'}
        labelTh={t('learningTrackSectionForm.title') + ' (TH)'}
        name={`${learningTrackSectionNamePrefix}.title`}
        placeholder={t('learningTrackSectionForm.title')}
        inputWrapperClassName="mb-3"
        onBlur={formik.handleBlur}
        value={learningTrackSection?.title}
        onChange={formik.handleChange}
        formikTouched={getIn(
          formik.touched,
          `${learningTrackSectionNamePrefix}.title`,
        )}
        formikErrors={getIn(
          formik.errors,
          `${learningTrackSectionNamePrefix}.title`,
        )}
      />

      <LearningTrackSectionCourseForm
        formik={formik}
        learningTrackSection={learningTrackSection}
        learningTrackSectionNamePrefix={learningTrackSectionNamePrefix}
      />
    </div>
  );
};

export default LearningTrackSectionForm;
