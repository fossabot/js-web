import { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import Layout from '../layouts/main.layout';
import MainNavbar from '../ui-kit/headers/MainNavbar';
import useTranslation from '../i18n/useTranslation';
import { withCatalogMenu } from '../hooks/useCatalogMenu';
import TopNavbar from './components/TopNavbar';
import CourseListSidebar from './components/CourseListSidebar';
import CourseList from './components/CourseList';
import useCourseList from './useCourseList';
import ConfirmArchiveCourseModal from './components/ConfirmArchiveCourseModal';
import { useModal } from '../ui-kit/Modal';
import {
  UserEnrolledCourseRaw,
  UserEnrolledCourseStatuses,
} from '../models/course';
import CourseApi from '../http/course.api';
import InfiniteScrollArea from '../ui-kit/InfiniteScrollArea';
import { useToasts } from 'react-toast-notifications';
import { Check, Archive, Reply } from '../ui-kit/icons';
import CourseListFilters from './components/CourseListFilters';

function ArchiveSuccessMessage({ t, onUndo }) {
  const [isUndo, setIsUndo] = useState(false);

  return (
    <div className="flex items-center">
      <div className="mr-1.5 rounded-full bg-white p-1.5 text-green-200">
        <Archive />
      </div>
      <div className="flex-1">
        {t('dashboardCourseListPage.archiveSuccessMessage')}
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
            <div>{t('dashboardCourseListPage.undo')}</div>
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
        {t('dashboardCourseListPage.unarchiveSuccessMessage', { status })}
      </div>
      {!isUndo && (
        <div
          className="ml-6 cursor-pointer text-brand-primary"
          onClick={() => {
            setIsUndo(true);
            onUndo();
          }}
        >
          {t('dashboardCourseListPage.undo')}
        </div>
      )}
    </div>
  );
}

function ArchiveErrorMessage({ t }) {
  return (
    <div className="flex items-center">
      <div>{t('dashboardCourseListPage.archiveErrorMessage')}</div>
    </div>
  );
}

function DashboardCoursesPage({ token }) {
  const { t } = useTranslation();
  const {
    courses,
    statuses,
    currentStatus,
    setCurrentStatus,
    reloadCourses,
    fetchCourseStatuses,
    fetchMoreCourses,
    loadingCourses,
    isEnded,
  } = useCourseList();
  const [selectedCourse, setSelectedCourse] =
    useState<UserEnrolledCourseRaw>(null);
  const [isLoadingArchive, setIsLoadingArchive] = useState(false);
  const confirmArchiveModal = useModal();
  const { addToast } = useToasts();

  function onToggleArchive(course: UserEnrolledCourseRaw) {
    if (course.isArchived) {
      removeArchiveCourse(course);
    } else {
      setSelectedCourse({ ...course });
      confirmArchiveModal.toggle();
    }
  }

  async function removeArchiveCourse(course: UserEnrolledCourseRaw) {
    setIsLoadingArchive(true);
    try {
      await CourseApi.removeArchiveCourse(course.id);
      let latestLearningStatus = t(
        'dashboardCourseListPage.statuses.notStarted',
      );
      if (course.averagePercentage > 0 && course?.averagePercentage < 100) {
        latestLearningStatus = t('dashboardCourseListPage.statuses.inProgress');
      } else if (course.averagePercentage >= 100) {
        latestLearningStatus = t('dashboardCourseListPage.statuses.completed');
      }
      addToast(
        <UnarchiveSuccessMessage
          t={t}
          onUndo={() => onConfirmArchiveCourse(course)}
          status={latestLearningStatus}
        />,
      );
      reloadCourses();
      fetchCourseStatuses();
    } catch {
      addToast(<ArchiveErrorMessage t={t} />, { appearance: 'error' });
    } finally {
      setIsLoadingArchive(false);
    }
  }

  async function onConfirmArchiveCourse(course: UserEnrolledCourseRaw) {
    setIsLoadingArchive(true);
    try {
      await CourseApi.addArchiveCourse(course.id);
      if (confirmArchiveModal.isOpen) {
        confirmArchiveModal.toggle();
      }
      reloadCourses();
      fetchCourseStatuses();
      addToast(
        <ArchiveSuccessMessage
          t={t}
          onUndo={() => removeArchiveCourse(course)}
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
    fetchMoreCourses();
  }

  function onStatusChanged(status: keyof UserEnrolledCourseStatuses) {
    setCurrentStatus(status);
  }

  const head = useMemo(
    () => (
      <Head>
        <title>
          {t('headerText')} | {t('dashboardCourseListPage.title')}
        </title>
      </Head>
    ),
    [],
  );

  useEffect(() => {
    fetchCourseStatuses();
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
            <CourseListFilters
              stats={statuses}
              currentStatus={currentStatus}
              onStatusChanged={onStatusChanged}
            />
          </div>
        </div>
      }
    >
      <div className="flex flex-1 lg:mx-auto lg:w-244">
        <CourseListSidebar />
        <div className="w-full">
          <div className="hidden lg:block">
            <CourseListFilters
              stats={statuses}
              currentStatus={currentStatus}
              onStatusChanged={onStatusChanged}
            />
          </div>
          <InfiniteScrollArea
            onScrollToBottom={onScrollToBottom}
            loading={loadingCourses !== null || isEnded}
          >
            <CourseList
              courses={courses}
              loading={loadingCourses}
              onToggleArchive={onToggleArchive}
            />
          </InfiniteScrollArea>
        </div>
        {!!selectedCourse && (
          <ConfirmArchiveCourseModal
            loading={isLoadingArchive}
            course={selectedCourse}
            isOpen={confirmArchiveModal.isOpen}
            toggle={confirmArchiveModal.toggle}
            onOk={() => onConfirmArchiveCourse(selectedCourse)}
          />
        )}
      </div>
    </Layout>,
  );
}

export default DashboardCoursesPage;
