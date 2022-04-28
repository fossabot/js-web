import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useEffect, useMemo, useState } from 'react';

import { centralHttp } from '../http';
import { Modal } from '../ui-kit/Modal';
import { flatten } from '../utils/array';
import API_PATHS from '../constants/apiPaths';
import InputSelect from '../ui-kit/InputSelect';
import useAsyncInput from '../hooks/useAsyncInput';

const AddUserToGroupModal = ({
  isOpen,
  toggle,
  groups,
  onAddAction,
  selectedGroup,
}) => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    getUsers();
  }, []);

  async function getUsers() {
    try {
      const response = await centralHttp.get(API_PATHS.ADMIN_USERS);
      setUsers(response.data.data);
    } catch (error) {
      console.error(error);
    }
  }

  function getUserLabel(user) {
    if (!user) {
      return '';
    }

    return `${user.firstName} ${user.lastName} <${user.email}>`;
  }

  const formik = useFormik({
    initialValues: {
      userId: users[0]?.id || '',
      groupId: selectedGroup?.id || '',
    },
    validationSchema: Yup.object({
      userId: Yup.string().required('Required'),
      groupId: Yup.string().required('Required'),
    }),
    enableReinitialize: true,
    onSubmit: handleFormSubmit,
  });

  const { getOptions: getUserOptions, inputValue: userInputValue } =
    useAsyncInput({
      http: centralHttp.get,
      fieldName: 'email',
      customLabel: getUserLabel,
      apiPath: API_PATHS.ADMIN_USERS,
      formikFieldValue: formik.values.userId,
    });

  async function handleFormSubmit(values) {
    if (!values.userId || !values.groupId) return;

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
      <Modal.Header toggle={toggle}>Add user to group</Modal.Header>
      <form onSubmit={formik.handleSubmit} autoComplete="off">
        <Modal.Body>
          <div>
            <div className="mb-3 flex flex-row justify-start align-middle">
              <InputSelect
                name="userId"
                formik={formik}
                value={{
                  label: userInputValue?.label || 'Select by email',
                  value: userInputValue?.value,
                }}
                promiseOptions={getUserOptions}
                onBlur={formik.handleBlur}
                selectClassWrapperName="mr-2 w-full"
                onChange={formik.handleChange}
                isAsync
                isSearchable
                isClearable
                error={formik.touched.userId && formik.errors.userId}
              />
            </div>
            <div className="mb-3 flex flex-row justify-start align-middle">
              <InputSelect
                name="groupId"
                formik={formik}
                isDisabled
                options={groups}
                value={{
                  value: formik.values.groupId,
                  label:
                    flatten(groups, 'children').find(
                      (g) => g.id === formik.values.groupId,
                    )?.name || '',
                }}
                renderOptions={renderGroups}
                onBlur={formik.handleBlur}
                selectClassWrapperName="mr-2 w-full"
                onChange={formik.handleChange}
                error={formik.touched.groupId && formik.errors.groupId}
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

export default AddUserToGroupModal;
