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
import AddTopicModal from './AddTopicModal';
import DeleteTopicModal from './DeleteTopicModal';
import TopicList from './TopicList';

const TopicListPage = () => {
  const { t } = useTranslation();
  const { data, totalPages, fetchData } = useList<any>((options) => {
    return getTopicsPromise(options);
  });
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [topic, setTopic] = useState(null);
  const [isSelectAll, setSelectAll] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);
  const [errorMessages, setErrorMessages] = useState([]);
  const addTopicModalProps = useModal();

  useEffect(() => {
    if (isSelectAll) setSelectedTopics([...data]);
    else setSelectedTopics([]);
  }, [isSelectAll]);
  const deleteTopicModalProps = useModal();

  const clearError = () => {
    setErrorMessages([]);
  };

  const handleError = (error) => {
    const msgs = getErrorMessages(error);
    setErrorMessages(msgs);
  };

  const getTopicsPromise = (options?) => {
    return centralHttp.get(API_PATHS.TOPICS, { params: options });
  };

  const deleteTopic = async (TopicIds: string[]) => {
    try {
      clearError();
      const url = `${API_PATHS.TOPICS}`;
      await centralHttp.delete(url, { data: { ids: TopicIds } });
    } catch (error) {
      handleError(error);
    }
  };

  const onDeleteAction = () => {
    deleteTopicModalProps.toggle();
  };

  const onConfirmDelete = async () => {
    try {
      setSubmitting(true);
      await deleteTopic(selectedTopics.map((t) => t.id));
      setSelectedTopics([]);
      fetchData();
    } catch (e) {
      console.log(e);
    } finally {
      setSubmitting(false);
    }
  };

  const onClickSelect = (topic) => {
    if (selectedTopics.find((t) => t.id == topic.id))
      setSelectedTopics(selectedTopics.filter((t) => t.id !== topic.id));
    else setSelectedTopics([...selectedTopics, topic]);
  };

  const onClickEdit = (topic) => {
    setTopic({ ...topic });
    addTopicModalProps.toggle();
  };

  const onClickAdd = () => {
    addTopicModalProps.toggle();
  };

  const onAddTopicCancel = () => {
    setTopic(null);
  };

  const onAddTopic = async (topic) => {
    try {
      clearError();

      topic.name = topic.name.trim();

      if (topic.id) {
        const url = `${API_PATHS.TOPICS}/${topic.id}`;
        await centralHttp.put(url, topic);
      } else {
        const url = `${API_PATHS.TOPICS}`;
        await centralHttp.post(url, topic);
      }
      setTopic(null);
      addTopicModalProps.toggle();
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
        BACKEND_ADMIN_CONTROL.ACCESS_TOPIC_MANAGEMENT,
      ]}
    >
      <AdminLayout>
        <Head>
          <title>{t('headerText')} | Topic List</title>
        </Head>
        <div className="mx-6 text-right lg:mx-8">
          <ErrorMessages
            messages={errorMessages}
            onClearAction={() => setErrorMessages([])}
          />
          <div className="mb-4 flex flex-col items-center justify-between lg:flex-row">
            <div className="flex w-full lg:w-1/4">
              <h2 className="mb-2 py-2 text-left font-bold text-black">
                All Topics
              </h2>
            </div>
            <div className="flex w-full flex-col items-center justify-end text-right lg:w-2/5 lg:flex-row">
              <div className="w-full lg:w-1/2">
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
                wrapperClassNames={'mt-4 lg:mt-0 lg:ml-4 w-full lg:w-1/2'}
                buttonName={'Actions'}
                menuItems={[
                  {
                    name: 'Delete Topic',
                    action: onDeleteAction,
                    isDisabled: selectedTopics.length < 1 || isSubmitting,
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
          <TopicList
            onDeleteAction={onDeleteAction}
            topics={data}
            totalPages={totalPages}
            setSelectAll={setSelectAll}
            isSelectAll={isSelectAll}
            selectedTopics={selectedTopics}
            onClickSelect={onClickSelect}
            onClickEdit={onClickEdit}
          />
        </div>
        <AddTopicModal
          onAddAction={onAddTopic}
          onCancelAction={onAddTopicCancel}
          topic={topic}
          isOpen={addTopicModalProps.isOpen}
          toggle={addTopicModalProps.toggle}
        />
        <DeleteTopicModal
          onDeleteAction={onConfirmDelete}
          isOpen={deleteTopicModalProps.isOpen}
          toggle={deleteTopicModalProps.toggle}
        />
      </AdminLayout>
    </AccessControl>
  );
};

export default TopicListPage;
