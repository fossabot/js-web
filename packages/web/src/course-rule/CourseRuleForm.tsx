import { FormikProps, getIn } from 'formik';

import Button from '../ui-kit/Button';
import { centralHttp } from '../http';
import API_PATHS from '../constants/apiPaths';
import { Close, Plus } from '../ui-kit/icons';
import InputSelect from '../ui-kit/InputSelect';
import InputSection from '../ui-kit/InputSection';
import useAsyncInput from '../hooks/useAsyncInput';
import {
  CourseRuleType,
  ICourseRule,
  ICourseRuleItem,
} from '../models/course-rule';
import { enumToArray } from '../utils/array';
import { CourseSubCategoryKey } from '../models/course';
import { useEffect } from 'react';

const CourseRuleItem = ({
  item,
  formik,
  index,
  ruleLength,
  onAddCourseRuleItem,
  onRemoveCourseRuleItem,
}: {
  index: number;
  ruleLength: number;
  item: ICourseRuleItem;
  formik: FormikProps<ICourseRule>;
  onAddCourseRuleItem: () => void;
  onRemoveCourseRuleItem: (index: number) => void;
}) => {
  function getCustomLabel(courseOutline) {
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

  const { getOptions: getAppliedForOptions, inputValue: appliedForInputValue } =
    useAsyncInput({
      http: centralHttp.get,
      apiPath: API_PATHS.COURSE_OUTLINES,
      formikFieldValue: item.appliedForId,
      customLabel: getCustomLabel,
      fieldName: 'title',
      apiParams: {
        id: item.appliedForId || undefined,
      },
    });

  const {
    getOptions: getAppliedByOptions,
    inputValue: appliedByInputValue,
    options: appliedByOptions,
  } = useAsyncInput({
    http: centralHttp.get,
    apiPath: API_PATHS.COURSE_OUTLINES,
    customLabel: getCustomLabel,
    formikFieldValue: item.appliedById,
    fieldName: 'title',
    apiParams: {
      id: item.appliedById || undefined,
    },
  });

  const courseRuleItemNamePrefix = `courseRuleItems[${index}]`;

  const ruleItem = formik.values.courseRuleItems[index];
  useEffect(() => {
    if (
      ruleItem.type === CourseRuleType.PRE_ASSESSMENT &&
      ruleItem.appliedById
    ) {
      const outline = appliedByOptions.find(
        (outline) => outline.id === ruleItem.appliedById,
      );
      if (outline && outline.category.key !== CourseSubCategoryKey.ASSESSMENT) {
        formik.setFieldValue(`${courseRuleItemNamePrefix}.appliedById`, '');
      }
    }
  }, [ruleItem.appliedById, ruleItem.type, appliedByOptions]);

  return (
    <li className="mb-2 flex w-full flex-col border border-gray-400 p-4 shadow lg:flex-row">
      <InputSelect
        name={`${courseRuleItemNamePrefix}.appliedForId`}
        formik={formik}
        label={'Rule for' + ' *'}
        value={{
          label: appliedForInputValue?.label || 'Please select',
          value: appliedForInputValue?.value,
        }}
        promiseOptions={getAppliedForOptions}
        placeholder={'Please select'}
        onBlur={formik.handleBlur}
        selectClassWrapperName="mr-1 mb-3"
        onChange={formik.handleChange}
        isAsync={true}
        isSearchable={true}
        error={
          getIn(formik.touched, `${courseRuleItemNamePrefix}.appliedForId`) &&
          getIn(formik.errors, `${courseRuleItemNamePrefix}.appliedForId`)
        }
      />
      <InputSelect
        name={`${courseRuleItemNamePrefix}.type`}
        formik={formik}
        label={'Rule type'}
        options={enumToArray(CourseRuleType)}
        value={{
          value: formik.values.courseRuleItems[index].type,
          label: formik.values.courseRuleItems[index].type,
        }}
        placeholder={'Please select'}
        selectClassWrapperName="mx-1 mb-3"
        onBlur={formik.handleBlur}
        onChange={formik.handleChange}
        error={
          getIn(formik.touched, `${courseRuleItemNamePrefix}.type`) &&
          getIn(formik.errors, `${courseRuleItemNamePrefix}.type`)
        }
      />
      <InputSelect
        name={`${courseRuleItemNamePrefix}.appliedById`}
        formik={formik}
        label={`${
          [CourseRuleType.BOOK, CourseRuleType.REQUIRED].includes(
            formik.values.courseRuleItems[index].type,
          )
            ? 'Pre'
            : ''
        } ${formik.values.courseRuleItems[
          index
        ].type.toUpperCase()} Course Outline *`}
        value={{
          label: appliedByInputValue?.label || 'Please select',
          value: appliedByInputValue?.value,
        }}
        promiseOptions={getAppliedByOptions}
        placeholder={'Please select'}
        onBlur={formik.handleBlur}
        selectClassWrapperName="ml-1 mb-3"
        onChange={formik.handleChange}
        isAsync={true}
        isSearchable={true}
        error={
          getIn(formik.touched, `${courseRuleItemNamePrefix}.appliedById`) &&
          getIn(formik.errors, `${courseRuleItemNamePrefix}.appliedById`)
        }
        filterOption={
          formik.values.courseRuleItems[index].type ===
          CourseRuleType.PRE_ASSESSMENT
            ? (option) =>
                option.data.data.category.key ===
                CourseSubCategoryKey.ASSESSMENT
            : undefined
        }
      />
      <div className="mt-2 flex w-full items-start justify-end pt-8 lg:mt-0 lg:w-1/2">
        {ruleLength > 1 ? (
          <span className="pl-1">
            <Button
              type="button"
              variant="secondary"
              size="small"
              onClick={() => onRemoveCourseRuleItem(index)}
            >
              <Close />
            </Button>
          </span>
        ) : null}
        {index === ruleLength - 1 ? (
          <span className="pl-1">
            <Button
              type="button"
              variant="secondary"
              size="small"
              onClick={onAddCourseRuleItem}
            >
              <Plus />
            </Button>
          </span>
        ) : null}
      </div>
    </li>
  );
};

const CourseRuleForm = ({
  formik,
  onAddCourseRuleItem,
  onRemoveCourseRuleItem,
}: {
  formik: FormikProps<ICourseRule>;
  onAddCourseRuleItem: () => void;
  onRemoveCourseRuleItem: (index: number) => void;
}) => {
  return (
    <form onSubmit={formik.handleSubmit} autoComplete="off">
      <div className="mb-6 w-full rounded border border-gray-400 bg-gray-100 p-4 shadow-sm">
        <InputSection
          formik={formik}
          label={'Name'}
          name="name"
          placeholder={'Name'}
          inputWrapperClassName="mb-3"
          value={formik.values.name}
          onBlur={formik.handleBlur}
          onChange={formik.handleChange}
          error={formik.touched.name && formik.errors.name}
        />

        <div className="m-3 rounded-md px-3 pt-6 pb-1 text-left">
          <div className="mb-3 text-subheading font-bold">Course Rules</div>
          {formik.values.courseRuleItems.map((cri, index) => {
            return (
              <CourseRuleItem
                key={index}
                item={cri}
                index={index}
                formik={formik}
                onAddCourseRuleItem={onAddCourseRuleItem}
                onRemoveCourseRuleItem={onRemoveCourseRuleItem}
                ruleLength={formik.values.courseRuleItems.length}
              />
            );
          })}
        </div>

        <Button
          size="medium"
          variant="primary"
          type="submit"
          disabled={!formik.isValid || formik.isSubmitting}
        >
          Save rules
        </Button>
      </div>
    </form>
  );
};

export default CourseRuleForm;
