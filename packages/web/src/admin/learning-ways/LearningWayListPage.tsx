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
import AddLearningWayModal from './AddLearningWayModal';
import DeleteLearningWayModal from './DeleteLearningWayModal';
import LearningWayList from './LearningWayList';

const LearningWayListPage = () => {
  const { t } = useTranslation();
  const { data, totalPages, fetchData } = useList<any>((options) => {
    return getLearningWaysPromise(options);
  });
  const [selectedLearningWays, setSelectedLearningWays] = useState([]);
  const [learningWay, setLearningWay] = useState(null);
  const [isSelectAll, setSelectAll] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);
  const [errorMessages, setErrorMessages] = useState([]);
  const addLearningWayModalProps = useModal();

  useEffect(() => {
    if (isSelectAll) setSelectedLearningWays([...data]);
    else setSelectedLearningWays([]);
  }, [isSelectAll]);
  const deleteLearningWayModalProps = useModal();

  const clearError = () => {
    setErrorMessages([]);
  };

  const getLearningWaysPromise = (options?) => {
    return centralHttp.get(API_PATHS.LEARNING_WAYS, { params: options });
  };

  const deleteLearningWay = async (LearningWayIds: string[]) => {
    try {
      clearError();
      const url = `${API_PATHS.LEARNING_WAYS}`;
      await centralHttp.delete(url, { data: { ids: LearningWayIds } });
    } catch (error) {
      const msg = getErrorMessages(error);
      setErrorMessages(msg);
    }
  };

  const onDeleteAction = () => {
    deleteLearningWayModalProps.toggle();
  };

  const onConfirmDelete = async () => {
    try {
      setSubmitting(true);
      await deleteLearningWay(selectedLearningWays.map((t) => t.id));
      setSelectedLearningWays([]);
      fetchData();
    } catch (e) {
      console.log(e);
    } finally {
      setSubmitting(false);
    }
  };

  const onClickSelect = (learningWay) => {
    if (selectedLearningWays.find((t) => t.id == learningWay.id))
      setSelectedLearningWays(
        selectedLearningWays.filter((t) => t.id !== learningWay.id),
      );
    else setSelectedLearningWays([...selectedLearningWays, learningWay]);
  };

  const onClickEdit = (learningWay) => {
    setLearningWay({ ...learningWay });
    addLearningWayModalProps.toggle();
  };

  const onClickAdd = () => {
    addLearningWayModalProps.toggle();
  };

  const onAddLearningWayCancel = () => {
    setLearningWay(null);
  };

  const onAddLearningWay = async (learningWay) => {
    try {
      clearError();

      learningWay.name = learningWay.name.trim();

      if (learningWay.id) {
        const url = `${API_PATHS.LEARNING_WAYS}/${learningWay.id}`;
        await centralHttp.put(url, learningWay);
      } else {
        const url = `${API_PATHS.LEARNING_WAYS}`;
        await centralHttp.post(url, learningWay);
      }
      setLearningWay(null);
      addLearningWayModalProps.toggle();
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
        BACKEND_ADMIN_CONTROL.ACCESS_LEARNING_WAY_MANAGEMENT,
      ]}
    >
      <AdminLayout>
        <Head>
          <title>{t('headerText')} | Learning Way List</title>
        </Head>
        <div className="mx-6 text-right lg:mx-8">
          <ErrorMessages
            messages={errorMessages}
            onClearAction={() => setErrorMessages([])}
          />
          <div className="mb-4 flex flex-col items-center justify-between lg:flex-row">
            <div className="flex w-full lg:w-1/4">
              <h2 className="mb-2 py-2 text-left font-bold text-black">
                All Learning Ways
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
                    name: 'Delete Learning Way',
                    action: onDeleteAction,
                    isDisabled: selectedLearningWays.length < 1 || isSubmitting,
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
          <LearningWayList
            onDeleteAction={onDeleteAction}
            learningWays={data}
            totalPages={totalPages}
            setSelectAll={setSelectAll}
            isSelectAll={isSelectAll}
            selectedLearningWays={selectedLearningWays}
            onClickSelect={onClickSelect}
            onClickEdit={onClickEdit}
          />
        </div>
        <AddLearningWayModal
          onAddAction={onAddLearningWay}
          onCancelAction={onAddLearningWayCancel}
          learningWay={learningWay}
          disabledName={learningWay?.key}
          isOpen={addLearningWayModalProps.isOpen}
          toggle={addLearningWayModalProps.toggle}
        />
        <DeleteLearningWayModal
          onDeleteAction={onConfirmDelete}
          isOpen={deleteLearningWayModalProps.isOpen}
          toggle={deleteLearningWayModalProps.toggle}
        />
      </AdminLayout>
    </AccessControl>
  );
};

export default LearningWayListPage;
