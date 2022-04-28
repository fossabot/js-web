import * as Yup from 'yup';
import { useEffect, useMemo } from 'react';
import { useFormik } from 'formik';

import { Modal } from '../../ui-kit/Modal';
import InputSelect from '../../ui-kit/InputSelect';
import InputSection from '../../ui-kit/InputSection';
import Button from '../../ui-kit/Button';

// TODO: Add more tag types here, if there are new types in system.
const tagTypes = ['course'];

const initialFormValues = {
  name: '',
  type: tagTypes[0],
};

const AddTagModal = ({ isOpen, toggle, tag, onAddAction, onCancelAction }) => {
  const formik = useFormik({
    initialValues: {
      name: tag?.name || initialFormValues.name,
      type: tag?.type || initialFormValues.type,
    },
    validationSchema: Yup.object({
      name: Yup.string()
        .matches(/[a-z0-9-]/)
        .required('required'),
      type: Yup.string().required('required'),
    }),
    enableReinitialize: true,
    onSubmit: handleFormSubmit,
  });

  async function handleFormSubmit(values) {
    if (!values.name) return;

    await onAddAction({ id: tag?.id, ...values });

    formik.resetForm();
    toggle();
  }

  const clearForm = () => {
    formik.resetForm();
  };

  const onCancel = (e) => {
    e.preventDefault();
    clearForm();
    toggle();
    onCancelAction();
  };

  const renderTags = useMemo(() => {
    return tagTypes.map((opt) => ({
      label: opt,
      value: opt,
    }));
  }, [tagTypes]);

  useEffect(() => {
    formik.setValues({
      name: tag?.name || initialFormValues.name,
      type: tag?.type || initialFormValues.type,
    });
  }, [tag]);

  useEffect(() => {
    if (!isOpen) {
      onCancelAction();
    }
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} toggle={toggle} skipOutsideClickEvent={true}>
      <Modal.Header toggle={toggle}>{tag ? 'Edit' : 'Add'} tag</Modal.Header>
      <form onSubmit={formik.handleSubmit} autoComplete="off">
        <Modal.Body>
          <div>
            <div className="mb-3 flex w-full flex-row items-baseline justify-center">
              <InputSection
                formik={formik}
                name="name"
                label="Tag name"
                placeholder="Tag name"
                inputWrapperClassName="mb-3"
                value={formik.values.name}
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                error={formik.touched.name && formik.errors.name}
              />
            </div>
            <div className="mb-3 flex flex-row justify-start align-middle">
              <InputSelect
                name="type"
                label="Tag type"
                formik={formik}
                options={tagTypes}
                value={{ label: formik.values.type, value: formik.values.type }}
                renderOptions={renderTags}
                onBlur={formik.handleBlur}
                selectClassWrapperName="mr-2 w-full"
                onChange={formik.handleChange}
                isClearable
              />
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <div className="flex-1" />
          <div className="flex flex-1 flex-row-reverse">
            <Button size="medium" variant="primary" type="submit">
              Save
            </Button>
            <Button
              onClick={onCancel}
              type="button"
              variant="secondary"
              size="medium"
              className="mr-4"
            >
              Cancel
            </Button>
          </div>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

export default AddTagModal;
