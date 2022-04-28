import { Dialog } from '@headlessui/react';
import cx from 'classnames';
import { format } from 'date-fns';
import { useFormik } from 'formik';
import { useCallback, useEffect, useRef } from 'react';
import * as Yup from 'yup';
import API_PATHS from '../../../constants/apiPaths';
import {
  SearchResults,
  UserGroupOrgMultiSelect,
} from '../../UserGroupOrgMultiSelect';
import useAsyncInput from '../../../hooks/useAsyncInput';
import { centralHttp } from '../../../http';
import { UserAssignedLearningTrack } from '../../../models/userAssignedLearningTrack';
import Button from '../../../ui-kit/Button';
import { DatePicker } from '../../../ui-kit/DatePicker/DatePicker';
import { Modal } from '../../../ui-kit/HeadlessModal';
import { Calendar, Close, Trash } from '../../../ui-kit/icons';
import InputField from '../../../ui-kit/InputField';
import InputSelect from '../../../ui-kit/InputSelect';

export interface ILearningTrackAssignedFormModal {
  data:
    | { type: 'add'; data: null }
    | { type: 'edit'; data: UserAssignedLearningTrack }
    | null;
  toggle: () => void;
  onSubmit: () => void;
}

interface IUserAssignedLearningTrackBody {
  learningTrackId: string;
  selectedOptions: SearchResults[];
  dueDateTime: Date | null;
}

export const LearningTrackAssignedFormModal = ({
  data,
  toggle,
  onSubmit,
}: ILearningTrackAssignedFormModal) => {
  const rootRef = useRef(document.getElementById('__next'));
  const focusRef = useRef(null);

  const onHandleSubmit = useCallback(
    async ({
      selectedOptions,
      learningTrackId,
      dueDateTime,
    }: IUserAssignedLearningTrackBody) => {
      if (data?.type === 'add') {
        const userIds: string[] = [];
        const groupIds: string[] = [];
        const organizationIds: string[] = [];
        for (const option of selectedOptions) {
          if (option.type === 'user') userIds.push(option.id);
          if (option.type === 'group') groupIds.push(option.id);
          if (option.type === 'organization') organizationIds.push(option.id);
        }
        await centralHttp.post(API_PATHS.USER_ASSIGNED_LEARNING_TRACK, {
          userIds,
          groupIds,
          organizationIds,
          learningTrackId,
          dueDateTime,
        });
      }
      if (data?.type === 'edit') {
        await centralHttp.put(
          API_PATHS.USER_ASSIGNED_LEARNING_TRACK_ID.replace(
            ':id',
            data.data.id,
          ),
          {
            learningTrackId,
            dueDateTime,
          },
        );
      }
      onSubmit();
      toggle();
    },
    [data?.data?.id, data?.type, onSubmit, toggle],
  );

  const formik = useFormik<IUserAssignedLearningTrackBody>({
    initialValues: {
      selectedOptions: [],
      learningTrackId: '',
      dueDateTime: null,
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
      learningTrackId: Yup.string().required('Required'),
    }),
  });

  const {
    getOptions: getLearningTrackOptions,
    inputValue: learningTrackInputValue,
  } = useAsyncInput({
    http: centralHttp.get,
    fieldName: 'title',
    apiPath: API_PATHS.LEARNING_TRACKS,
    formikFieldValue: formik.values.learningTrackId,
  });

  useEffect(() => {
    if (data) {
      if (data.type === 'add') {
        formik.resetForm();
      }
      if (data.type === 'edit') {
        formik.setValues({
          learningTrackId: data.data.learningTrack.id,
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
      await centralHttp.delete(API_PATHS.USER_ASSIGNED_LEARNING_TRACK, {
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
          {data?.type === 'add' ? 'Add' : 'Edit'} Required / Assigned Learning
          Track
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
        name="learningTrackId"
        label="Learning Track"
        value={{
          label: learningTrackInputValue.label || 'Select...',
          value: learningTrackInputValue.value,
        }}
        isAsync
        promiseOptions={getLearningTrackOptions}
        placeholder={'Select...'}
        selectClassWrapperName="mt-4"
        onBlur={formik.handleBlur}
        isSearchable
        onChange={formik.handleChange}
        error={formik.touched.learningTrackId && formik.errors.learningTrackId}
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
            {data?.type === 'add' ? 'Add learning track' : 'Save changes'}
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
