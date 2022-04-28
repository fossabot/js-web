import { Dialog } from '@headlessui/react';
import cx from 'classnames';
import { format } from 'date-fns';
import { useFormik } from 'formik';
import { useCallback, useEffect, useRef } from 'react';
import * as Yup from 'yup';
import API_PATHS from '../../constants/apiPaths';
import useAsyncInput from '../../hooks/useAsyncInput';
import { centralHttp } from '../../http';
import {
  UserAssignedCourse,
  UserAssignedCourseType,
} from '../../models/userAssignedCourse';
import Button from '../../ui-kit/Button';
import { DatePicker } from '../../ui-kit/DatePicker/DatePicker';
import { Modal } from '../../ui-kit/HeadlessModal';
import { Calendar, Close, Trash } from '../../ui-kit/icons';
import InputField from '../../ui-kit/InputField';
import InputSelect from '../../ui-kit/InputSelect';
import RadioButton from '../../ui-kit/RadioButton';
import {
  SearchResults,
  UserGroupOrgMultiSelect,
} from '../../admin/UserGroupOrgMultiSelect';

export interface ICourseRequiredAssignedFormModal {
  data:
    | { type: 'add'; data: null }
    | { type: 'edit'; data: UserAssignedCourse }
    | null;
  toggle: () => void;
  onSubmit: () => void;
}

interface IUserAssignedCourseBody {
  assignmentType: UserAssignedCourseType;
  courseId: string;
  selectedOptions: SearchResults[];
  dueDateTime: Date | null;
}

export const CourseRequiredAssignedFormModal = ({
  data,
  toggle,
  onSubmit,
}: ICourseRequiredAssignedFormModal) => {
  const rootRef = useRef(document.getElementById('__next'));
  const focusRef = useRef(null);

  const onHandleSubmit = useCallback(
    async ({
      selectedOptions,
      assignmentType,
      courseId,
      dueDateTime,
    }: IUserAssignedCourseBody) => {
      if (data?.type === 'add') {
        const userIds: string[] = [];
        const groupIds: string[] = [];
        const organizationIds: string[] = [];
        for (const option of selectedOptions) {
          if (option.type === 'user') userIds.push(option.id);
          if (option.type === 'group') groupIds.push(option.id);
          if (option.type === 'organization') organizationIds.push(option.id);
        }
        await centralHttp.post(API_PATHS.USER_ASSIGNED_COURSES, {
          userIds,
          groupIds,
          organizationIds,
          courseId,
          dueDateTime,
          assignmentType,
        });
      }
      if (data?.type === 'edit') {
        await centralHttp.put(
          API_PATHS.USER_ASSIGNED_COURSES_ID.replace(':id', data.data.id),
          {
            courseId,
            dueDateTime,
            assignmentType,
          },
        );
      }
      onSubmit();
      toggle();
    },
    [data?.data?.id, data?.type, onSubmit, toggle],
  );

  const formik = useFormik<IUserAssignedCourseBody>({
    initialValues: {
      selectedOptions: [],
      courseId: '',
      dueDateTime: null,
      assignmentType: UserAssignedCourseType.Optional,
    },
    onSubmit: onHandleSubmit,
    validationSchema: Yup.object({
      selectedOptions: Yup.array()
        .of(
          Yup.object({
            id: Yup.string(),
            name: Yup.string(),
          }),
        )
        .min(1, 'Select at least one user'),
      courseId: Yup.string().required('Required'),
    }),
  });

  const { getOptions: getCourseOptions, inputValue: courseInputValue } =
    useAsyncInput({
      http: centralHttp.get,
      fieldName: 'title',
      apiPath: API_PATHS.COURSES,
      formikFieldValue: formik.values.courseId,
    });

  useEffect(() => {
    if (data) {
      if (data.type === 'add') {
        formik.resetForm();
      }
      if (data.type === 'edit') {
        formik.setValues({
          assignmentType: data.data.assignmentType,
          courseId: data.data.course.id,
          dueDateTime: data.data.dueDateTime
            ? new Date(data.data.dueDateTime)
            : null,
          selectedOptions: [
            {
              id: data.data.user.id,
              name: data.data.user.email,
              type: 'user',
            },
          ],
        });
      }
    }
  }, [data]);

  const onDelete = async () => {
    if (data?.data) {
      await centralHttp.delete(API_PATHS.USER_ASSIGNED_COURSES, {
        data: {
          ids: [data.data.id],
        },
      });
      onSubmit();
      toggle();
    }
  };

  return (
    <Modal
      isOpen={data !== null}
      toggle={toggle}
      skipFullWidth
      initialFocusRef={focusRef}
      className="box-content w-140 p-5 lg:p-8"
      skipOutsideClickEvent
    >
      <Dialog.Title as="div" className="flex justify-between">
        <span className="text-subheading font-semibold text-black">
          {data?.type === 'add' ? 'Add' : 'Edit'} Required / Assigned Course
        </span>
      </Dialog.Title>

      <div className="my-4 mb-6 h-px w-full bg-gray-200" />

      {data?.type === 'add' ? (
        <UserGroupOrgMultiSelect
          selectedOptions={formik.values.selectedOptions}
          setSelectedOptions={(options) =>
            formik.setFieldValue('selectedOptions', options)
          }
          error={
            formik.touched.selectedOptions &&
            formik.errors.selectedOptions &&
            String(formik.errors.selectedOptions)
          }
          onBlur={() => {
            formik.setFieldTouched('selectedOptions', true);
          }}
        />
      ) : (
        <InputField
          name=""
          value={formik.values.selectedOptions[0]?.name}
          disabled
        />
      )}

      <InputSelect
        formik={formik}
        name="courseId"
        label="Course"
        value={{
          label: courseInputValue.label || 'Select...',
          value: courseInputValue.value,
        }}
        isAsync
        promiseOptions={getCourseOptions}
        placeholder={'Select...'}
        selectClassWrapperName="mt-4"
        onBlur={formik.handleBlur}
        isSearchable
        onChange={formik.handleChange}
        error={formik.touched.courseId && formik.errors.courseId}
      />

      <div className="mt-4">
        <div className="mb-2 text-caption font-bold">Expiry Date & Time</div>
        <DatePicker
          startDate={formik.values.dueDateTime}
          onChange={([date]) => formik.setFieldValue('dueDateTime', date)}
          size="small"
          closeCalendarOnChange={false}
          placement="auto"
          portalElement={rootRef.current}
          withTime
        >
          {({ ref, showCalendar }) => (
            <div
              tabIndex={-1}
              ref={ref}
              className="flex w-full cursor-pointer items-center space-x-2 rounded-lg border border-gray-300 px-4 py-2"
              onClick={showCalendar}
            >
              <Calendar />
              <span
                className={cx('flex-1', {
                  'text-gray-500': !formik.values.dueDateTime,
                  'text-black': formik.values.dueDateTime,
                })}
              >
                {formik.values.dueDateTime
                  ? format(formik.values.dueDateTime, 'dd MMM yyyy, HH:mm')
                  : 'Select Expiry Date & Time'}
              </span>
              {formik.values.dueDateTime && (
                <a
                  role="button"
                  className="text-gray-500"
                  onClick={(e) => {
                    e.stopPropagation();
                    formik.setFieldValue('dueDateTime', null);
                  }}
                >
                  <Close />
                </a>
              )}
            </div>
          )}
        </DatePicker>
      </div>

      <div className="mt-4">
        <div className="mb-2 text-caption font-bold">Course type</div>
        <div className="flex w-full space-x-4">
          {(
            [
              { value: UserAssignedCourseType.Optional, label: 'Assigned' },
              { value: UserAssignedCourseType.Required, label: 'Required' },
            ] as const
          ).map((option) => (
            <Button
              key={option.value}
              variant="secondary"
              size="large"
              onClick={() =>
                formik.setFieldValue('assignmentType', option.value)
              }
            >
              <div className="flex flex-1 items-center space-x-3">
                <RadioButton
                  name={option.value}
                  checked={formik.values.assignmentType === option.value}
                ></RadioButton>
                <span>{option.label}</span>
              </div>
            </Button>
          ))}
        </div>
      </div>

      <div className="mt-8 flex justify-between">
        {data?.type === 'edit' ? (
          <Button
            avoidFullWidth
            size="medium"
            variant="ghost"
            type="button"
            className="space-x-2 font-semibold"
            onClick={() => onDelete()}
          >
            <Trash />
            <span>Remove</span>
          </Button>
        ) : (
          <div />
        )}

        <div className="flex justify-end">
          <Button
            ref={focusRef}
            avoidFullWidth
            className="order-1 ml-4 font-semibold"
            size="medium"
            variant="primary"
            type="button"
            onClick={() => {
              formik.handleSubmit();
            }}
            isLoading={formik.isSubmitting}
            disabled={formik.isSubmitting}
          >
            {data?.type === 'add' ? 'Add course' : 'Save changes'}
          </Button>
          <Button
            avoidFullWidth
            className="order-0 font-semibold"
            size="medium"
            variant="secondary"
            type="button"
            onClick={() => toggle()}
          >
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
};
