import Head from 'next/head';
import { useEffect, useState } from 'react';
import { FaTrash } from 'react-icons/fa';
import { AccessControl } from '../../app-state/accessControl';
import API_PATHS from '../../constants/apiPaths';
import { BACKEND_ADMIN_CONTROL } from '../../constants/policies';
import useList from '../../hooks/useList';
import { centralHttp } from '../../http';
import useTranslation from '../../i18n/useTranslation';
import { AdminLayout } from '../../layouts/admin.layout';
import Button from '../../ui-kit/Button';
import DropdownButton from '../../ui-kit/DropdownButton';
import ErrorMessages from '../../ui-kit/ErrorMessage';
import { useModal } from '../../ui-kit/Modal';
import { getErrorMessages } from '../../utils/error';
import AddTagModal from './AddTagModal';
import DeleteTagModal from './DeleteTagModal';
import TagList from './TagList';

const TagListPage = () => {
  const { t } = useTranslation();
  const { data, totalPages, fetchData } = useList<any>((options) => {
    return getTagsPromise(options);
  });
  const [selectedTags, setSelectedTags] = useState([]);
  const [tag, setTag] = useState(null);
  const [isSelectAll, setSelectAll] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);
  const [errorMessages, setErrorMessages] = useState([]);
  const addTagModalProps = useModal();

  useEffect(() => {
    if (isSelectAll) setSelectedTags([...data]);
    else setSelectedTags([]);
  }, [isSelectAll]);
  const deleteTagModalProps = useModal();

  const clearError = () => {
    setErrorMessages([]);
  };

  const getTagsPromise = (options?) => {
    return centralHttp.get(API_PATHS.TAGS, { params: options });
  };

  const deleteTag = async (TagIds: string[]) => {
    try {
      clearError();
      const url = `${API_PATHS.TAGS}`;
      await centralHttp.delete(url, { data: { ids: TagIds } });
    } catch (error) {
      const msg = getErrorMessages(error);
      setErrorMessages(msg);
    }
  };

  const onDeleteAction = () => {
    deleteTagModalProps.toggle();
  };

  const onConfirmDelete = async () => {
    try {
      setSubmitting(true);
      await deleteTag(selectedTags.map((t) => t.id));
      setSelectedTags([]);
      fetchData();
    } catch (e) {
      console.log(e);
    } finally {
      setSubmitting(false);
    }
  };

  const onClickSelect = (tag) => {
    if (selectedTags.find((t) => t.id == tag.id))
      setSelectedTags(selectedTags.filter((t) => t.id !== tag.id));
    else setSelectedTags([...selectedTags, tag]);
  };

  const onClickEdit = (tag) => {
    setTag({ ...tag });
    addTagModalProps.toggle();
  };

  const onClickAdd = () => {
    addTagModalProps.toggle();
  };

  const onAddTagCancel = () => {
    setTag(null);
  };

  const onAddTag = async (tag) => {
    try {
      clearError();

      tag.name = tag.name
        .trim()
        .toLowerCase()
        .replace(/(\W+|[-]+)/gim, '-');

      if (tag.id) {
        const url = `${API_PATHS.TAGS}/${tag.id}`;
        await centralHttp.put(url, tag);
      } else {
        const url = `${API_PATHS.TAGS}`;
        await centralHttp.post(url, tag);
      }
      setTag(null);
      addTagModalProps.toggle();
      fetchData();
    } catch (error) {
      const msg = getErrorMessages(error);
      setErrorMessages(msg);
    }
  };

  return (
    <AccessControl
      policyNames={[
        BACKEND_ADMIN_CONTROL.ACCESS_ADMIN_PORTAL,
        BACKEND_ADMIN_CONTROL.ACCESS_TAG_MANAGEMENT,
      ]}
    >
      <AdminLayout>
        <Head>
          <title>{t('headerText')} | Tag List</title>
        </Head>
        <div className="mx-6 text-right lg:mx-8">
          <ErrorMessages
            messages={errorMessages}
            onClearAction={() => setErrorMessages([])}
          />
          <div className="mb-4 flex items-center justify-between">
            <div className="flex w-1/4">
              <h2 className="mb-2 py-2 text-left font-bold text-black">
                All Tags
              </h2>
            </div>
            <div className="flex w-2/5 flex-row items-center justify-end text-right">
              <div className="w-1/2">
                <Button
                  type="button"
                  size="medium"
                  variant="primary"
                  className="w-1/2"
                  onClick={onClickAdd}
                >
                  Create
                </Button>
              </div>
              <DropdownButton
                wrapperClassNames={'ml-4 w-1/2'}
                buttonName={'Actions'}
                menuItems={[
                  {
                    name: 'Delete Tag',
                    action: onDeleteAction,
                    isDisabled: selectedTags.length < 1 || isSubmitting,
                    activeIcon: (
                      <FaTrash
                        className="mr-2 h-5 w-5 text-red-200"
                        aria-hidden="true"
                      />
                    ),
                    inactiveIcon: (
                      <FaTrash
                        className="mr-2 h-5 w-5 text-red-200"
                        aria-hidden="true"
                      />
                    ),
                  },
                ]}
              />
            </div>
          </div>
          <TagList
            onDeleteAction={onDeleteAction}
            tags={data}
            totalPages={totalPages}
            setSelectAll={setSelectAll}
            isSelectAll={isSelectAll}
            selectedTags={selectedTags}
            onClickSelect={onClickSelect}
            onClickEdit={onClickEdit}
          />
        </div>
        <AddTagModal
          onAddAction={onAddTag}
          onCancelAction={onAddTagCancel}
          tag={tag}
          isOpen={addTagModalProps.isOpen}
          toggle={addTagModalProps.toggle}
        />
        <DeleteTagModal
          onDeleteAction={onConfirmDelete}
          isOpen={deleteTagModalProps.isOpen}
          toggle={deleteTagModalProps.toggle}
        />
      </AdminLayout>
    </AccessControl>
  );
};

export default TagListPage;
