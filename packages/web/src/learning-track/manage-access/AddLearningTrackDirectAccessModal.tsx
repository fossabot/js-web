import * as Yup from 'yup';
import { FC, useEffect, useRef } from 'react';
import { useFormik } from 'formik';
import DatePicker from 'react-datepicker';
import { Dialog } from '@headlessui/react';

import 'react-datepicker/dist/react-datepicker.css';

import { centralHttp } from '../../http';
import Button from '../../ui-kit/Button';
import { Close } from '../../ui-kit/icons';
import API_PATHS from '../../constants/apiPaths';
import { Modal } from '../../ui-kit/HeadlessModal';
import InputSelect from '../../ui-kit/InputSelect';
import RadioButton from '../../ui-kit/RadioButton';
import useAsyncInput from '../../hooks/useAsyncInput';
import useTranslation from '../../i18n/useTranslation';
import {
  ILearningTrackDirectAccess,
  LearningTrackDirectAccessorType,
} from '../../models/learningTrackDirectAccess';

interface IAddLearningTrackDirectAccessModal {
  isOpen: boolean;
  toggle: (bool?) => void;
  onSubmit: (arg: any, id?: string) => Promise<void>;
  headingText: string;
  currentEditableItem?: ILearningTrackDirectAccess;
  onCloseUpdateModal?: () => void;
}

export const AddLearningTrackDirectAccessModal: FC<IAddLearningTrackDirectAccessModal> =
  ({
    isOpen,
    toggle,
    onSubmit,
    headingText,
    currentEditableItem,
    onCloseUpdateModal,
  }) => {
    const buttonRef = useRef();
    const { t } = useTranslation();

    const formik = useFormik({
      initialValues: {
        accessorId: '',
        accessorType: LearningTrackDirectAccessorType.User,
        learningTrackId: '',
        expiryDateTime: new Date().toISOString(),
      },
      validationSchema: Yup.object({
        accessorId: Yup.string().required('required'),
        accessorType: Yup.string().required('required'),
        learningTrackId: Yup.string().required('required'),
        expiryDateTime: Yup.string().required('required'),
      }),
      validateOnBlur: false,
      onSubmit: async (values) => {
        await onSubmit(values, currentEditableItem?.id);
        onCloseModal();
      },
    });

    useEffect(() => {
      if (currentEditableItem && currentEditableItem.id) {
        formik.setValues({
          accessorId: currentEditableItem.accessorId,
          accessorType: currentEditableItem.accessorType,
          learningTrackId: currentEditableItem.learningTrack.id,
          expiryDateTime: currentEditableItem.expiryDateTime,
        });
      }
    }, [currentEditableItem]);

    const { getOptions: getUserOptions, inputValue: userInputValue } =
      useAsyncInput({
        fieldName: 'email',
        http: centralHttp.get,
        apiPath: API_PATHS.ADMIN_USERS,
        formikFieldValue: formik.values.accessorId,
        apiParams: {
          id: formik.values.accessorId || undefined,
        },
      });
    const { getOptions: getGroupOptions, inputValue: groupInputValue } =
      useAsyncInput({
        fieldName: 'name',
        http: centralHttp.get,
        apiPath: API_PATHS.GROUPS_SEARCH,
        formikFieldValue: formik.values.accessorId,
        apiParams: {
          id: formik.values.accessorId || undefined,
        },
      });
    const {
      getOptions: getOrganizationOptions,
      inputValue: organizationInputValue,
    } = useAsyncInput({
      fieldName: 'name',
      http: centralHttp.get,
      apiPath: API_PATHS.ORGANIZATIONS,
      formikFieldValue: formik.values.accessorId,
      apiParams: {
        id: formik.values.accessorId || undefined,
      },
    });
    const {
      getOptions: getLearningTrackOptions,
      inputValue: learningTrackInputValue,
    } = useAsyncInput({
      fieldName: 'title',
      http: centralHttp.get,
      apiPath: API_PATHS.LEARNING_TRACKS,
      formikFieldValue: formik.values.learningTrackId,
      apiParams: {
        id: formik.values.accessorId || undefined,
      },
    });

    const onCloseModal = () => {
      formik.resetForm();
      onCloseUpdateModal?.();
      toggle(false);
    };

    const onRadioOptionChange = async (e) => {
      await formik.setFieldValue('accessorId', '');
      formik.handleChange(e);
    };

    return (
      <Modal
        isOpen={isOpen}
        initialFocusRef={buttonRef}
        toggle={onCloseModal}
        skipOutsideClickEvent
        className="w-344px space-y-4 overflow-visible p-5 lg:w-472px lg:p-8"
      >
        <Dialog.Title as="div" className="flex flex-row justify-between">
          <p className="text-heading font-bold">{headingText}</p>
          <Close
            className="h-6 w-6 cursor-pointer text-black hover:text-gray-600"
            onClick={() => onCloseModal()}
          />
        </Dialog.Title>
        <div className="flex flex-col space-y-4 pt-4">
          <form onSubmit={formik.handleSubmit} autoComplete="off">
            {!currentEditableItem && (
              <div className="mb-3">
                <label
                  className={
                    'flex w-full cursor-pointer items-center space-x-3 rounded-xl border border-gray-300 p-4'
                  }
                >
                  <RadioButton
                    name="accessorType"
                    inputClassName={'p-3 cursor-pointer'}
                    value={LearningTrackDirectAccessorType.User}
                    onBlur={formik.handleBlur}
                    onChange={onRadioOptionChange}
                    checked={
                      formik.values.accessorType ===
                      LearningTrackDirectAccessorType.User
                    }
                    readOnly
                  />
                  <span>Add to User</span>
                </label>
                <label
                  className={
                    'mt-4 flex w-full cursor-pointer items-center space-x-3 rounded-xl border border-gray-300 p-4'
                  }
                >
                  <RadioButton
                    name="accessorType"
                    inputClassName={'p-3 cursor-pointer'}
                    value={LearningTrackDirectAccessorType.Group}
                    onBlur={formik.handleBlur}
                    onChange={onRadioOptionChange}
                    checked={
                      formik.values.accessorType ===
                      LearningTrackDirectAccessorType.Group
                    }
                    readOnly
                  />
                  <span>Add to Group</span>
                </label>
                <label
                  className={
                    'mt-4 flex w-full cursor-pointer items-center space-x-3 rounded-xl border border-gray-300 p-4'
                  }
                >
                  <RadioButton
                    name="accessorType"
                    inputClassName={'p-3 cursor-pointer'}
                    value={LearningTrackDirectAccessorType.Organization}
                    onBlur={formik.handleBlur}
                    onChange={onRadioOptionChange}
                    checked={
                      formik.values.accessorType ===
                      LearningTrackDirectAccessorType.Organization
                    }
                    readOnly
                  />
                  <span>Add to Organization</span>
                </label>
              </div>
            )}
            {formik.values.accessorType ===
              LearningTrackDirectAccessorType.User && (
              <InputSelect
                name="accessorId"
                formik={formik}
                isDisabled={!formik.values.accessorType}
                label={'User *'}
                value={{
                  label: userInputValue.label || 'Please select',
                  value: userInputValue.value,
                }}
                promiseOptions={getUserOptions}
                placeholder="Please select"
                onBlur={formik.handleBlur}
                selectClassWrapperName="mb-3"
                onChange={(e) => {
                  formik.handleChange(e);
                }}
                error={formik.touched.accessorId && formik.errors.accessorId}
                isAsync={true}
                isSearchable={true}
              />
            )}
            {formik.values.accessorType ===
              LearningTrackDirectAccessorType.Group && (
              <InputSelect
                name="accessorId"
                formik={formik}
                isDisabled={!formik.values.accessorType}
                label={'Group *'}
                value={{
                  label: groupInputValue.label || 'Please select',
                  value: groupInputValue.value,
                }}
                promiseOptions={getGroupOptions}
                placeholder="Please select"
                onBlur={formik.handleBlur}
                selectClassWrapperName="mb-3"
                onChange={(e) => {
                  formik.handleChange(e);
                }}
                error={formik.touched.accessorId && formik.errors.accessorId}
                isAsync={true}
                isSearchable={true}
              />
            )}
            {formik.values.accessorType ===
              LearningTrackDirectAccessorType.Organization && (
              <InputSelect
                name="accessorId"
                formik={formik}
                isDisabled={!formik.values.accessorType}
                label={'Organization *'}
                value={{
                  label: organizationInputValue.label || 'Please select',
                  value: organizationInputValue.value,
                }}
                promiseOptions={getOrganizationOptions}
                placeholder="Please select"
                onBlur={formik.handleBlur}
                selectClassWrapperName="mb-3"
                onChange={(e) => {
                  formik.handleChange(e);
                }}
                error={formik.touched.accessorId && formik.errors.accessorId}
                isAsync={true}
                isSearchable={true}
              />
            )}
            <InputSelect
              name="learningTrackId"
              formik={formik}
              label={'Learning Track *'}
              value={{
                label: learningTrackInputValue.label || 'Please select',
                value: learningTrackInputValue.value,
              }}
              promiseOptions={getLearningTrackOptions}
              placeholder="Please select"
              onBlur={formik.handleBlur}
              selectClassWrapperName="mb-3"
              onChange={(e) => {
                formik.handleChange(e);
              }}
              error={
                formik.touched.learningTrackId && formik.errors.learningTrackId
              }
              isAsync={true}
              isSearchable={true}
            />
            <div className="mb-3 flex w-full flex-col items-start">
              <label
                htmlFor="expiryDateTime"
                className={'mb-2 text-caption font-bold'}
              >
                {'Expiry Date Time *'}
              </label>
              <DatePicker
                className="outline-none z-0 w-full rounded-lg border bg-white px-4 py-2 text-body disabled:opacity-50"
                timeInputLabel="Time:"
                dateFormat="MM/dd/yyyy h:mm aa"
                showTimeInput
                showPopperArrow={false}
                name="expiryDateTime"
                onChange={(date) => {
                  formik.handleChange({
                    target: {
                      value: date.toISOString(),
                      name: 'expiryDateTime',
                    },
                  });
                }}
                selected={new Date(formik.values.expiryDateTime)}
              />
            </div>
          </form>
          <div className="flex w-2/4 flex-row justify-between space-x-4 self-end">
            <Button
              className="font-semibold"
              size="medium"
              variant="secondary"
              type="button"
              onClick={() => onCloseModal()}
            >
              {t('cancel')}
            </Button>
            <Button
              ref={buttonRef}
              className="font-semibold"
              size="medium"
              variant="primary"
              type="button"
              onClick={() => formik.handleSubmit()}
            >
              {t('save')}
            </Button>
          </div>
        </div>
      </Modal>
    );
  };
