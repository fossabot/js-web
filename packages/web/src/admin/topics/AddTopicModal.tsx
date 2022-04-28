import * as Yup from 'yup';
import { useEffect, useState } from 'react';
import { useFormik } from 'formik';

import { Modal } from '../../ui-kit/Modal';
import InputSelect from '../../ui-kit/InputSelect';
import InputSection from '../../ui-kit/InputSection';
import InputTextArea from '../../ui-kit/InputTextArea';
import { centralHttp } from '../../http';
import API_PATHS from '../../constants/apiPaths';
import { Topic } from '../../models/topic';
import Button from '../../ui-kit/Button';

const initialFormValues = {
  name: '',
  description: '',
  parentId: undefined,
};

async function getParentTopics() {
  const res = await centralHttp.get(API_PATHS.TOPICS_TREE);
  const nodes = res.data.data as Topic[];
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

const AddTopicModal = ({
  isOpen,
  toggle,
  topic,
  onAddAction,
  onCancelAction,
}) => {
  const [flattenParents, setFlattenParents] = useState({});
  const formik = useFormik({
    initialValues: {
      name: topic?.name || initialFormValues.name,
      description: topic?.description || initialFormValues.description,
      parentId: topic?.parent?.id || initialFormValues.parentId,
    },
    validationSchema: Yup.object({
      name: Yup.string().required('required'),
      parentId: Yup.string(),
    }),
    enableReinitialize: true,
    onSubmit: handleFormSubmit,
  });

  async function handleFormSubmit(values) {
    if (!values.name) return;

    await onAddAction({ id: topic?.id, ...values });

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
    const topicTree = await getParentTopics();
    const flatten = flattenTree(topicTree);
    setFlattenParents(flatten);
    return renderParentTopics(topicTree);
  }

  function renderParentTopics(nodes, indent = '') {
    let list = [];
    nodes.forEach((node) => {
      list.push({ label: indent + node.name, value: node.id });
      if (node.children && node.children.length) {
        list = [
          ...list,
          ...renderParentTopics(node.children, indent + '\xa0\xa0\xa0\xa0'),
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
        name: topic?.name || initialFormValues.name,
        description: topic?.description || initialFormValues.description,
        parentId: topic?.parent?.id || initialFormValues.parentId,
      });
    }
  }, [isOpen, topic]);

  return (
    <Modal isOpen={isOpen} toggle={toggle} skipOutsideClickEvent={true}>
      <Modal.Header toggle={toggle}>
        {topic ? 'Edit' : 'Add'} topic
      </Modal.Header>
      <form onSubmit={formik.handleSubmit} autoComplete="off">
        <Modal.Body>
          <div>
            <div className="mb-3 flex w-full flex-row items-baseline justify-center">
              <InputSection
                formik={formik}
                name="name"
                label="Topic name"
                placeholder="Topic name"
                inputWrapperClassName="mb-3"
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
            {!topic && (
              <div className="mb-3 flex flex-row justify-start align-middle">
                <InputSelect
                  name="parentId"
                  label="Parent topic"
                  formik={formik}
                  value={{
                    label:
                      flattenParents[formik.values.parentId]?.name ||
                      '--- Choose parent topic ---',
                    value: formik.values.parentId,
                  }}
                  onBlur={formik.handleBlur}
                  selectClassWrapperName="mr-2 w-full"
                  onChange={formik.handleChange}
                  isClearable
                  isAsync={true}
                  promiseOptions={loadParentTree}
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

export default AddTopicModal;
