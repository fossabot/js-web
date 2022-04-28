import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { FaPersonBooth, FaTrash } from 'react-icons/fa';
import { AccessControl } from '../../app-state/accessControl';
import { BACKEND_ADMIN_CONTROL } from '../../constants/policies';
import WEB_PATHS from '../../constants/webPaths';
import useList from '../../hooks/useList';
import LearningTrackApi from '../../http/learningTrack.api';
import { AdminLayout } from '../../layouts/admin.layout';
import Button from '../../ui-kit/Button';
import ConfirmationModal from '../../ui-kit/ConfirmationModal';
import DropdownButton from '../../ui-kit/DropdownButton';
import { useModal } from '../../ui-kit/Modal';
import LearningTrackList from './LearningTrackList';

const LearningTrackListPage = () => {
  const router = useRouter();

  const [selectedLearningTracks, setSelectedLearningTracks] = useState([]);
  const [isSelectAll, setSelectAll] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);
  const deleteModalState = useModal();
  const learningTrackApi = LearningTrackApi;
  const { data, totalPages, fetchData } = useList<any>((options) => {
    return learningTrackApi.getLearningTracks(options);
  });

  useEffect(() => {
    if (isSelectAll)
      setSelectedLearningTracks([...data.map((item) => item.id)]);
    else setSelectedLearningTracks([]);
  }, [isSelectAll]);

  const routeToCreate = () => {
    router.push(WEB_PATHS.LEARNING_TRACK_CREATE);
  };

  const onClickSelect = (id: string) => {
    if (selectedLearningTracks.includes(id)) {
      setSelectedLearningTracks(
        selectedLearningTracks.filter((id) => id !== id),
      );
    } else {
      setSelectedLearningTracks([...selectedLearningTracks, id]);
    }
  };

  const onClickDelete = () => {
    deleteModalState.toggle();
  };

  const onConfirmDelete = async () => {
    try {
      setSubmitting(true);
      await learningTrackApi.deleteLearningTracks(selectedLearningTracks);
      setSelectedLearningTracks([]);
      fetchData();
    } catch (e) {
      console.log(e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AccessControl
      policyNames={[
        BACKEND_ADMIN_CONTROL.ACCESS_ADMIN_PORTAL,
        BACKEND_ADMIN_CONTROL.ACCESS_LEARNING_TRACK_MANAGEMENT,
      ]}
    >
      <AdminLayout>
        <Head>
          <title>Learning track list</title>
        </Head>
        <div className="mx-6 lg:mx-8">
          <div className="mb-2 flex flex-col items-center justify-between lg:flex-row">
            <div className="flex w-full lg:w-1/4">
              <h2 className="py-2 text-left font-bold text-black">
                Learning Tracks
              </h2>
            </div>
            <div className="mb-4 flex w-full flex-col items-center justify-end text-right lg:w-2/5 lg:flex-row">
              <div className="mx-1 w-full lg:w-1/2">
                <Button
                  size="medium"
                  type="submit"
                  variant="primary"
                  onClick={routeToCreate}
                >
                  Create
                </Button>
              </div>
              <DropdownButton
                wrapperClassNames={'mx-1 mt-4 lg:mt-0 w-full lg:w-1/2'}
                buttonName={'Actions'}
                menuItems={[
                  {
                    name: 'Manage direct access',
                    action: () =>
                      router.push(WEB_PATHS.LEARNING_TRACK_MANAGE_ACCESS),
                    isDisabled: isSubmitting,
                    activeIcon: (
                      <FaPersonBooth
                        className="mr-2 h-5 w-5 text-yellow-200"
                        aria-hidden="true"
                      />
                    ),
                    inactiveIcon: (
                      <FaPersonBooth
                        className="mr-2 h-5 w-5 text-yellow-200"
                        aria-hidden="true"
                      />
                    ),
                  },
                  {
                    name: 'Delete Learning Track',
                    action: onClickDelete,
                    isDisabled:
                      selectedLearningTracks.length < 1 || isSubmitting,
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
          <LearningTrackList
            learningTracks={data}
            totalPages={totalPages}
            onClickSelect={onClickSelect}
            isSelectAll={isSelectAll}
            setSelectAll={setSelectAll}
            selectedLearningTracks={selectedLearningTracks}
          />
        </div>
        <ConfirmationModal
          body={
            <p>Are you sure to permanently delete selected learning tracks?</p>
          }
          header="Delete learning track"
          onOk={onConfirmDelete}
          isOpen={deleteModalState.isOpen}
          toggle={deleteModalState.toggle}
        />
      </AdminLayout>
    </AccessControl>
  );
};

export default LearningTrackListPage;
