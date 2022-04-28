import * as Yup from 'yup';
import { useMemo } from 'react';
import { useFormik } from 'formik';

import { flatten } from '../utils/array';
import { Modal } from '../ui-kit/Modal';
import InputSelect from '../ui-kit/InputSelect';
import InputSection from '../ui-kit/InputSection';

const AddGroupModal = ({
  isOpen,
  toggle,
  groups,
  onAddAction,
  selectedGroup,
}) => {
  const formik = useFormik({
    initialValues: {
      name: '',
      parentGroupId: selectedGroup?.id || '',
    },
    validationSchema: Yup.object({
      name: Yup.string().required('Required'),
      parentGroupId: Yup.string().optional(),
    }),
    enableReinitialize: true,
    onSubmit: handleFormSubmit,
  });

  async function handleFormSubmit(values) {
    if (!values.name) return;

    await onAddAction(values);

    formik.resetForm();
    toggle();
  }

  const renderGroups = useMemo(() => {
    return flatten(groups, 'children')
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((opt) => ({ label: opt.name, value: opt.id }));
  }, [groups]);

  return (
    <Modal isOpen={isOpen} toggle={toggle} skipOutsideClickEvent={true}>
      <Modal.Header toggle={toggle}>Add group</Modal.Header>
      <form onSubmit={formik.handleSubmit} autoComplete="off">
        <Modal.Body>
          <div>
            <div className="mb-3 flex w-full flex-row items-baseline justify-center">
              <InputSection
                formik={formik}
                name="name"
                placeholder="Group name"
                inputWrapperClassName="mb-3"
                value={formik.values.name}
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                error={formik.touched.name && formik.errors.name}
              />
            </div>
            <div className="mb-3 flex flex-row justify-start align-middle">
              <InputSelect
                name="parentGroupId"
                formik={formik}
                options={groups}
                value={{
                  value: formik.values.parentGroupId,
                  label:
                    flatten(groups, 'children').find(
                      (g) => g.id === formik.values.parentGroupId,
                    )?.name || '',
                }}
                renderOptions={renderGroups}
                onBlur={formik.handleBlur}
                selectClassWrapperName="mr-2 w-full"
                onChange={formik.handleChange}
                isClearable
                isSearchable
              />
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <div className="flex-1" />
          <div className="flex flex-1 flex-row-reverse">
            <button
              type="submit"
              className="outline-none focus:outline-none mx-2 mb-3 w-full cursor-pointer rounded bg-brand-primary py-2 px-4 font-bold text-white focus:ring"
            >
              Save
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                toggle();
              }}
              className="outline-none focus:outline-none mx-2 mb-3 w-full cursor-pointer rounded bg-brand-primary py-2 px-4 font-bold text-white focus:ring"
            >
              Cancel
            </button>
          </div>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

export default AddGroupModal;
