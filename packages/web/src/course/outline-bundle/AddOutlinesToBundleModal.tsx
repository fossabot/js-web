import { Dialog } from '@headlessui/react';
import { useFormik } from 'formik';
import { FC } from 'react';
import * as Yup from 'yup';
import API_PATHS from '../../constants/apiPaths';
import useMultiAsyncInput from '../../hooks/useMultiAsyncInput';
import { centralHttp } from '../../http';
import useTranslation from '../../i18n/useTranslation';
import Button from '../../ui-kit/Button';
import { Modal } from '../../ui-kit/HeadlessModal';
import { Close } from '../../ui-kit/icons';
import InputSelect from '../../ui-kit/InputSelect';

interface IAddOutlinesToBundleModal {
  isOpen: boolean;
  toggle: (bool?) => void;
  onSubmit: (ids: string[]) => Promise<void>;
  headingText: string;
}

const AddOutlinesToBundleModal: FC<IAddOutlinesToBundleModal> = ({
  isOpen,
  toggle,
  onSubmit,
  headingText,
}) => {
  const { t } = useTranslation();

  const formik = useFormik({
    initialValues: {
      courseOutlineIds: [],
    },
    validationSchema: Yup.object({
      courseOutlineIds: Yup.array()
        .of(Yup.string())
        .min(1, 'required')
        .required('required'),
    }),
    validateOnBlur: false,
    enableReinitialize: true,
    onSubmit: async (values) => {
      await onSubmit(values.courseOutlineIds);
      onCloseModal();
    },
  });

  const { getOptions, inputValues, onValueChange } = useMultiAsyncInput({
    fieldName: 'courseCode',
    http: centralHttp.get,
    apiPath: API_PATHS.COURSE_OUTLINES,
    formikFieldValue: formik.values.courseOutlineIds,
  });

  const onCloseModal = () => {
    formik.resetForm();
    toggle(false);
  };

  return (
    <Modal
      isOpen={isOpen}
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
          <InputSelect
            name="courseOutlineIds"
            formik={formik}
            label="Course Code"
            value={inputValues}
            promiseOptions={getOptions}
            placeholder={t('courseOutlineForm.pleaseSelect')}
            onBlur={formik.handleBlur}
            selectClassWrapperName="mb-3"
            onChange={(e) => {
              onValueChange(e.target.value);
              formik.handleChange(e);
            }}
            error={
              formik.touched.courseOutlineIds && formik.errors.courseOutlineIds
            }
            isMulti={true}
            isAsync={true}
            isSearchable={true}
          />
        </form>
        <div className="flex w-2/4 flex-row justify-between space-x-4 self-end">
          <Button
            className="font-semibold"
            size="medium"
            variant="secondary"
            type="button"
            onClick={() => onCloseModal()}
          >
            {t('courseOutlineBundlePage.cancelModal')}
          </Button>
          <Button
            className="font-semibold"
            size="medium"
            variant="primary"
            type="button"
            onClick={() => formik.handleSubmit()}
          >
            {t('courseOutlineBundlePage.saveModal')}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AddOutlinesToBundleModal;
