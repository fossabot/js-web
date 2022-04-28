import React, { useState } from 'react';
import { uniqBy } from 'lodash';
import { FormikProps, useFormik } from 'formik';

import Button from '../../ui-kit/Button';
import { centralHttp } from '../../http';
import { Close } from '../../ui-kit/icons';
import { Language } from '../../models/language';
import API_PATHS from '../../constants/apiPaths';
import InputSelect from '../../ui-kit/InputSelect';
import useTranslation from '../../i18n/useTranslation';
import { getLanguageValue } from '../../i18n/lang-utils';
import {
  ILearningTrack,
  ILearningTrackSection,
  ISectionCourse,
} from '../../models/learningTrack';
import useMultiAsyncInput from '../../hooks/useMultiAsyncInput';
import InputCheckbox from '../../ui-kit/InputCheckbox';

const CourseItem = ({
  item,
  index,
  courseLength,
  onRemoveCourse,
  onToggleIsRequired,
}: {
  index: number;
  courseLength: number;
  item: Partial<ISectionCourse<Language | string>>;
  onRemoveCourse: (index: number) => void;
  onToggleIsRequired: (index: number, checked: boolean) => void;
}) => {
  if (courseLength < 1) return;

  return (
    <li className="mb-2 flex w-full flex-row items-center justify-between border border-gray-400 p-4 shadow">
      <div>
        {typeof item.title === 'string'
          ? item.title
          : getLanguageValue(item.title)}
      </div>
      <div className="flex items-center justify-between space-x-6">
        <InputCheckbox
          name="is-required-course"
          checked={item.isRequired}
          label="Required course"
          onChange={(e) => onToggleIsRequired(index, e.target.checked)}
        />
        <span className="pl-1">
          <Button
            type="button"
            variant="secondary"
            size="small"
            onClick={() => onRemoveCourse(index)}
          >
            <Close />
          </Button>
        </span>
      </div>
    </li>
  );
};

const LearningTrackSectionCourseForm = ({
  formik,
  learningTrackSection,
  learningTrackSectionNamePrefix,
}: {
  formik: FormikProps<ILearningTrack<Language>>;
  learningTrackSectionNamePrefix: string;
  learningTrackSection: ILearningTrackSection<Language>;
}) => {
  const { t } = useTranslation();

  const courseFormik = useFormik({
    initialValues: {
      courseIds: [],
    },
    onSubmit: handleSubmitCourses,
  });

  const [requireByDefault, setRequireByDefault] = useState(true);

  const {
    getOptions: getCourseOptions,
    inputValues: courseInputValues,
    onValueChange: onCoursesValueChange,
    cachedOptions: courseCachedOptions,
  } = useMultiAsyncInput({
    http: centralHttp.get,
    apiPath: API_PATHS.COURSES,
    fieldName: 'title',
    formikFieldValue: courseFormik.values.courseIds,
  });

  function handleSubmitCourses({ courseIds }: { courseIds: string[] }) {
    const items = courseCachedOptions
      .filter((it) => courseIds.includes(it.id))
      .map((x) => ({ ...x, isRequired: requireByDefault }));
    const newArr = uniqBy([...learningTrackSection.courses, ...items], 'id');
    courseFormik.setValues({
      courseIds: [],
    });

    formik.setFieldValue(`${learningTrackSectionNamePrefix}.courses`, newArr);
  }

  function onRemoveCourse(i) {
    const arr = [...learningTrackSection.courses];
    arr.splice(i, 1);

    formik.setFieldValue(`${learningTrackSectionNamePrefix}.courses`, arr);
  }

  function onToggleIsRequired(i: number, checked: boolean) {
    learningTrackSection.courses[i].isRequired = checked;
    formik.setFieldValue(
      `${learningTrackSectionNamePrefix}.courses`,
      learningTrackSection.courses,
    );
  }

  return (
    <div className="m-3 rounded-md px-3 pt-6 pb-1 text-left">
      <div className="mb-3 text-subheading font-bold">Courses</div>
      <InputSelect
        formik={courseFormik}
        name="courseIds"
        label={'Select courses'}
        value={courseInputValues}
        isAsync={true}
        isMulti={true}
        isSearchable={true}
        promiseOptions={getCourseOptions}
        placeholder={t('learningTrackForm.pleaseSelect')}
        onBlur={courseFormik.handleBlur}
        selectClassWrapperName="my-4"
        onChange={(e) => {
          onCoursesValueChange(e.target.value);
          courseFormik.handleChange(e);
        }}
        error={courseFormik.touched.courseIds && courseFormik.errors.courseIds}
      />
      <div className="mb-12 lg:flex lg:flex-row lg:items-end lg:justify-between">
        <InputCheckbox
          name="require-by-default"
          checked={requireByDefault}
          label="Required Course"
          onChange={(e) => setRequireByDefault(e.target.checked)}
        />
        <div className="lg:w-1/2">
          <Button
            type="button"
            variant="primary"
            size="medium"
            onClick={() => handleSubmitCourses(courseFormik.values)}
          >
            Add to section
          </Button>
        </div>
      </div>
      {learningTrackSection.courses.map((cri, index) => {
        return (
          <CourseItem
            key={index}
            item={cri}
            index={index}
            onRemoveCourse={onRemoveCourse}
            courseLength={learningTrackSection.courses.length}
            onToggleIsRequired={onToggleIsRequired}
          />
        );
      })}
    </div>
  );
};

export default LearningTrackSectionCourseForm;
