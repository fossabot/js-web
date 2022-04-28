import { Dialog } from '@headlessui/react';
import { useFormik } from 'formik';
import { FC } from 'react';
import * as Yup from 'yup';
import useTranslation from '../../i18n/useTranslation';
import Button from '../../ui-kit/Button';
import { Modal } from '../../ui-kit/HeadlessModal';
import { Close } from '../../ui-kit/icons';
import InputSection from '../../ui-kit/InputSection';

interface IAddOutlineBundleModal {
  isOpen: boolean;
  toggle: (bool?) => void;
  onSubmit: (name: string) => void;
  defaultName?: string;
  headingText: string;
}

const AddOutlineBundleModal: FC<IAddOutlineBundleModal> = ({
  isOpen,
  toggle,
  onSubmit,
  defaultName = '',
  headingText,
}) => {
  const { t } = useTranslation();

  const formik = useFormik({
    initialValues: {
      name: defaultName,
    },
    validationSchema: Yup.object({
      name: Yup.string().required('required'),
    }),
    validateOnBlur: false,
    enableReinitialize: true,
    onSubmit: async (values) => {
      await onSubmit(values.name);
      onCloseModal();
    },
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
      className="w-344px space-y-4 p-5 lg:w-472px lg:p-8"
    >
      <Dialog.Title as="div" className="flex flex-row justify-between">
        <p className="text-heading font-bold">{headingText}</p>
        <Close
          className="h-6 w-6 cursor-pointer text-black hover:text-gray-600"
          onClick={() => onCloseModal()}
        />
      </Dialog.Title>
      <div className="flex flex-col space-y-4">
        <form onSubmit={formik.handleSubmit} autoComplete="off">
          <InputSection
            formik={formik}
            name="name"
            value={formik.values.name}
            placeholder="Bundle name"
            error={formik.touched.name && formik.errors.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
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

export default AddOutlineBundleModal;
