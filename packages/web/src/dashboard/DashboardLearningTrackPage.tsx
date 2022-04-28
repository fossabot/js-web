import { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import Layout from '../layouts/main.layout';
import MainNavbar from '../ui-kit/headers/MainNavbar';
import useTranslation from '../i18n/useTranslation';
import { withCatalogMenu } from '../hooks/useCatalogMenu';
import TopNavbar from './components/TopNavbar';
import LearningTrackListSidebar from './components/LearningTrackSidebar';
import LearningTrackList from './components/LearningTrackList';
import useLearningTrackList from './useLearningTrackList';
import ConfirmArchiveLearningTrackModal from './components/ConfirmArchiveLearningTrackModal';
import { useModal } from '../ui-kit/Modal';
import {
  UserEnrolledLearningTrackRaw,
  UserEnrolledLearningTrackStatus,
} from '../models/learningTrack';
import LearningTrackApi from '../http/learningTrack.api';
import InfiniteScrollArea from '../ui-kit/InfiniteScrollArea';
import { useToasts } from 'react-toast-notifications';
import { Check, Archive, Reply } from '../ui-kit/icons';
import LearningTrackListFilters from './components/LearningTrackListFilters';

function ArchiveSuccessMessage({ t, onUndo }) {
  const [isUndo, setIsUndo] = useState(false);

  return (
    <div className="flex items-center">
      <div className="mr-1.5 rounded-full bg-white p-1.5 text-green-200">
        <Archive />
      </div>
      <div className="flex-1">
        {t('dashboardLearningTrackListPage.archiveSuccessMessage')}
      </div>
      <div className="ml-8 lg:ml-12">
        {!isUndo && (
          <div
            className="flex cursor-pointer items-center rounded-lg bg-green-300 px-3 py-2 text-white"
            onClick={() => {
              setIsUndo(true);
              onUndo();
            }}
          >
            <Reply className="mr-1 h-4 w-4" />
            <div>{t('dashboardLearningTrackListPage.undo')}</div>
          </div>
        )}
      </div>
    </div>
  );
}

function UnarchiveSuccessMessage({ t, onUndo, status }) {
  const [isUndo, setIsUndo] = useState(false);

  return (
    <div className="flex items-center">
      <Check className="mr-4 h-4 w-4" />
      <div className="flex-1">
        {t('dashboardLearningTrackListPage.unarchiveSuccessMessage', {
          status,
        })}
      </div>
      {!isUndo && (
        <div
          className="ml-6 cursor-pointer text-brand-primary"
          onClick={() => {
            setIsUndo(true);
            onUndo();
          }}
        >
          {t('dashboardLearningTrackListPage.undo')}
        </div>
      )}
    </div>
  );
}

function ArchiveErrorMessage({ t }) {
  return (
    <div className="flex items-center">
      <div>{t('dashboardLearningTrackListPage.archiveErrorMessage')}</div>
    </div>
  );
}

function DashboardLearningTracksPage({ token }) {
  const { t } = useTranslation();
  const {
    learningTracks,
    statuses,
    currentStatus,
    setCurrentStatus,
    reloadLearningTracks,
    fetchLearningTrackStatuses,
    fetchMoreLearningTracks,
    loadingLearningTracks,
    isEnded,
  } = useLearningTrackList();
  const [selectedLearningTrack, setSelectedLearningTrack] =
    useState<UserEnrolledLearningTrackRaw>(null);
  const [isLoadingArchive, setIsLoadingArchive] = useState(false);
  const confirmArchiveModal = useModal();
  const { addToast } = useToasts();

  function onToggleArchive(learningTrack: UserEnrolledLearningTrackRaw) {
    if (learningTrack.isArchived) {
      removeArchiveLearningTrack(learningTrack);
    } else {
      setSelectedLearningTrack({ ...learningTrack });
      confirmArchiveModal.toggle();
    }
  }

  async function removeArchiveLearningTrack(
    learningTrack: UserEnrolledLearningTrackRaw,
  ) {
    setIsLoadingArchive(true);
    try {
      await LearningTrackApi.removeArchiveLearningTrack(learningTrack.id);
      let latestLearningStatus = t(
        'dashboardLearningTrackListPage.statuses.notStarted',
      );
      if (
        learningTrack.averagePercentage > 0 &&
        learningTrack?.averagePercentage < 100
      ) {
        latestLearningStatus = t(
          'dashboardLearningTrackListPage.statuses.inProgress',
        );
      } else if (learningTrack.averagePercentage >= 100) {
        latestLearningStatus = t(
          'dashboardLearningTrackListPage.statuses.completed',
        );
      }
      addToast(
        <UnarchiveSuccessMessage
          t={t}
          onUndo={() => onConfirmArchiveLearningTrack(learningTrack)}
          status={latestLearningStatus}
        />,
      );
      reloadLearningTracks();
      fetchLearningTrackStatuses();
    } catch {
      addToast(<ArchiveErrorMessage t={t} />, { appearance: 'error' });
    } finally {
      setIsLoadingArchive(false);
    }
  }

  async function onConfirmArchiveLearningTrack(
    learningTrack: UserEnrolledLearningTrackRaw,
  ) {
    setIsLoadingArchive(true);
    try {
      await LearningTrackApi.addArchiveLearningTrack(learningTrack.id);
      if (confirmArchiveModal.isOpen) {
        confirmArchiveModal.toggle();
      }
      reloadLearningTracks();
      fetchLearningTrackStatuses();
      addToast(
        <ArchiveSuccessMessage
          t={t}
          onUndo={() => removeArchiveLearningTrack(learningTrack)}
        />,
        {
          appearance: 'success',
        },
      );
    } catch {
      addToast(<ArchiveErrorMessage t={t} />, { appearance: 'error' });
    } finally {
      setIsLoadingArchive(false);
    }
  }

  function onScrollToBottom() {
    fetchMoreLearningTracks();
  }

  function onStatusChanged(status: UserEnrolledLearningTrackStatus) {
    setCurrentStatus(status);
  }

  const head = useMemo(
    () => (
      <Head>
        <title>
          {t('headerText')} | {t('dashboardLearningTrackListPage.title')}
        </title>
      </Head>
    ),
    [],
  );

  useEffect(() => {
    fetchLearningTrackStatuses();
  }, []);

  return withCatalogMenu(
    <Layout
      head={head}
      header={<MainNavbar token={token} />}
      noMobilePadding={true}
      topContent={
        <div className="sticky left-0 top-16 z-40">
          <TopNavbar />
          <div className="lg:hidden">
            <LearningTrackListFilters
              stats={statuses}
              currentStatus={currentStatus}
              onStatusChanged={onStatusChanged}
            />
          </div>
        </div>
      }
    >
      <div className="flex flex-1 lg:mx-auto lg:w-244">
        <LearningTrackListSidebar />
        <div className="w-full">
          <div className="hidden lg:block">
            <LearningTrackListFilters
              stats={statuses}
              currentStatus={currentStatus}
              onStatusChanged={onStatusChanged}
            />
          </div>
          <InfiniteScrollArea
            onScrollToBottom={onScrollToBottom}
            loading={loadingLearningTracks || isEnded}
          >
            <LearningTrackList
              learningTracks={learningTracks}
              onToggleArchive={onToggleArchive}
            />
          </InfiniteScrollArea>
        </div>
        {!!selectedLearningTrack && (
          <ConfirmArchiveLearningTrackModal
            loading={isLoadingArchive}
            learningTrack={selectedLearningTrack}
            isOpen={confirmArchiveModal.isOpen}
            toggle={confirmArchiveModal.toggle}
            onOk={() => onConfirmArchiveLearningTrack(selectedLearningTrack)}
          />
        )}
      </div>
    </Layout>,
  );
}

export default DashboardLearningTracksPage;
