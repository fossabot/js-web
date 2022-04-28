import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useEffect, useState } from 'react';

import { centralHttp } from '../../http';
import Button from '../../ui-kit/Button';
import { Modal } from '../../ui-kit/Modal';
import API_PATHS from '../../constants/apiPaths';
import InputSelect from '../../ui-kit/InputSelect';
import InputSection from '../../ui-kit/InputSection';
import InputTextArea from '../../ui-kit/InputTextArea';
import { LearningWay } from '../../models/learning-way';

const initialFormValues = {
  name: '',
  description: '',
  parentId: undefined,
};

async function getParentLearningWays() {
  const res = await centralHttp.get(API_PATHS.LEARNING_WAYS_TREE);
  const nodes = res.data.data as LearningWay[];
  return nodes;
}

function flattenTree(nodes) {
  let flatten = {};
  for (const node of nodes) {
    flatten[node.id] = node;
    if (node.children && node.children.length) {
      const childrenFlatten = flattenTree(node.children);
      flatten = Object.assign(flatten, childrenFlatten);
    }
  }
  return flatten;
}

const AddLearningWayModal = ({
  isOpen,
  toggle,
  learningWay,
  onAddAction,
  onCancelAction,
  disabledName = false,
}) => {
  const [flattenParents, setFlattenParents] = useState({});
  const formik = useFormik({
    initialValues: {
      name: learningWay?.name || initialFormValues.name,
      description: learningWay?.description || initialFormValues.description,
      parentId: learningWay?.parent?.id || initialFormValues.parentId,
    },
    validationSchema: Yup.object({
      name: Yup.string().required('required'),
      parentId: Yup.string().required('required'),
    }),
    enableReinitialize: true,
    onSubmit: handleFormSubmit,
  });

  async function handleFormSubmit(values) {
    if (!values.name) return;

    await onAddAction({ id: learningWay?.id, ...values });

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

  async function loadParentTree() {
    const learningWayTree = await getParentLearningWays();
    const flatten = flattenTree(learningWayTree);
    setFlattenParents(flatten);
    return renderParentLearningWays(learningWayTree);
  }

  function renderParentLearningWays(nodes, indent = '') {
    let list = [];
    nodes.forEach((node) => {
      list.push({ label: indent + node.name, value: node.id });
      if (node.children && node.children.length) {
        list = [
          ...list,
          ...renderParentLearningWays(
            node.children,
            indent + '\xa0\xa0\xa0\xa0',
          ),
        ];
      }
    });
    return list;
  }

  useEffect(() => {
    if (!isOpen) {
      onCancelAction();
    } else {
      formik.setValues({
        name: learningWay?.name || initialFormValues.name,
        description: learningWay?.description || initialFormValues.description,
        parentId: learningWay?.parent?.id || initialFormValues.parentId,
      });
    }
  }, [isOpen, learningWay]);

  return (
    <Modal isOpen={isOpen} toggle={toggle} skipOutsideClickEvent={true}>
      <Modal.Header toggle={toggle}>
        {learningWay ? 'Edit' : 'Add'} learning way
      </Modal.Header>
      <form onSubmit={formik.handleSubmit} autoComplete="off">
        <Modal.Body>
          <div>
            <div className="mb-3 flex w-full flex-row items-baseline justify-center">
              <InputSection
                formik={formik}
                name="name"
                label="Name"
                placeholder="Name"
                inputWrapperClassName="mb-3"
                disabled={disabledName}
                value={formik.values.name}
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                error={formik.touched.name && formik.errors.name}
              />
            </div>
            <div className="mb-3 flex w-full flex-row items-baseline justify-center">
              <InputTextArea
                name="description"
                label="Description"
                textareaProps={{
                  onBlur: formik.handleBlur,
                  onChange: formik.handleChange,
                  value: formik.values.description,
                  rows: 4,
                }}
                inputWrapperClassName="mb-3"
              />
            </div>
            {!learningWay && (
              <div className="mb-3 flex flex-row justify-start align-middle">
                <InputSelect
                  name="parentId"
                  label="Parent"
                  formik={formik}
                  value={{
                    label:
                      flattenParents[formik.values.parentId]?.name ||
                      '--- Choose parent ---',
                    value: formik.values.parentId,
                  }}
                  onBlur={formik.handleBlur}
                  selectClassWrapperName="mr-2 w-full"
                  onChange={formik.handleChange}
                  isClearable
                  isAsync={true}
                  promiseOptions={loadParentTree}
                  error={formik.touched.parentId && formik.errors.parentId}
                />
              </div>
            )}
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

export default AddLearningWayModal;
