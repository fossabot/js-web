import Link from 'next/link';
import cx from 'classnames';
import { useMemo, useState } from 'react';
import useTranslation from '../../i18n/useTranslation';
import { CourseSessionOverview } from '../../models/course-session';
import Button from '../../ui-kit/Button';
import {
  Calendar,
  ChevronLeft,
  DotsHorizontal,
  ExternalLink,
  Location,
  Pencil,
  Person,
  Plus,
  SoundUpGray,
  Trash,
  VirtualGray,
} from '../../ui-kit/icons';
import ProgressBadge from './ProgressBadge';
import {
  CourseLanguage,
  CourseSessionStatus,
  CourseSubCategoryKey,
  ICourseSession,
} from '../../models/course';
import WEB_PATHS from '../../constants/webPaths';
import SessionTimeSlotSelector from './SessionTimeSlotsSelector';
import CourseSessionDatePicker from './CourseSessionDatePicker';
import { useRouter } from 'next/router';
import { format } from 'date-fns';

interface ISessionHeader {
  courseSession: CourseSessionOverview;
  relatedCourseSessions: ICourseSession[];
  onClickAddRegistrant: () => void;
  onClickExport: () => void;
  onClickEdit: () => void;
  onClickCancelSession: () => void;
}

function SessionHeader({
  courseSession,
  relatedCourseSessions,
  onClickAddRegistrant,
  onClickCancelSession,
  onClickEdit,
  onClickExport,
}: ISessionHeader) {
  const { t } = useTranslation();
  const router = useRouter();
  const [isOpenAdditionMenu, setIsOpenAdditionMenu] = useState(false);

  function toggleAdditionMenu() {
    setIsOpenAdditionMenu(!isOpenAdditionMenu);
  }

  const startTime = useMemo(() => {
    if (courseSession?.startDateTime) {
      return format(
        new Date(courseSession.startDateTime),
        'eee - dd MMM yy',
      ).toUpperCase();
    } else {
      return '';
    }
  }, [courseSession?.startDateTime]);

  const actionableStatuses = useMemo(
    () => [
      CourseSessionStatus.NOT_STARTED,
      CourseSessionStatus.IN_PROGRESS,
      CourseSessionStatus.COMPLETED,
    ],
    [],
  );

  const sessionCancellableStatuses = useMemo(
    () => [CourseSessionStatus.NOT_STARTED, CourseSessionStatus.IN_PROGRESS],
    [],
  );

  return (
    <header>
      <div>
        <a
          className="flex items-center text-caption font-semibold text-gray-650"
          onClick={(e) => {
            e.preventDefault();
            router.back();
          }}
          href={WEB_PATHS.SESSION_MANAGEMENT}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          <span>{t('sessionParticipantManagementPage.back')}</span>
        </a>
      </div>
      <div className="mt-4 flex flex-col justify-between rounded-2xl border border-gray-200 lg:flex-row">
        <div className="border-b border-gray-200 p-4 lg:w-55 lg:border-b-0 lg:border-r">
          <div className="flex items-center text-caption text-gray-500">
            <Calendar className="mr-2.5" />
            <span>{t('sessionParticipantManagementPage.date')}</span>
          </div>
          <div className="mt-3 text-heading font-semibold">{startTime}</div>
          <CourseSessionDatePicker />
        </div>
        <div className="flex-1 p-6">
          {!!courseSession && (
            <div className="flex flex-col lg:flex-row">
              <div className="mr-4 mb-4 lg:mb-0">
                <img
                  className="h-44 w-44 rounded-2xl object-cover object-center lg:h-22 lg:w-22"
                  src={
                    courseSession.courseImageKey
                      ? `${process.env.NEXT_PUBLIC_CDN_BASE_URL}/${courseSession.courseImageKey}`
                      : '/assets/course/course-default.png'
                  }
                />
              </div>
              <div className="flex-1">
                <div className="mb-2 text-subheading font-semibold">
                  {courseSession.courseTitle}
                </div>
                <div className="flex items-center">
                  <ProgressBadge status={courseSession.sessionStatus} />
                  <div className="ml-2 flex items-center border-l border-r border-gray-200 px-2 text-caption font-semibold text-gray-650">
                    <Person className="mr-1 w-4 text-gray-300" />
                    {courseSession.booked}/{courseSession.seats}
                  </div>
                  <div className="ml-2 flex items-center border-r border-gray-200 px-2 text-caption font-semibold text-gray-650">
                    <VirtualGray className="mr-1 w-4 text-gray-300" />
                    {courseSession.courseSubCategoryKey ===
                      CourseSubCategoryKey.VIRTUAL &&
                      `${t('virtual')} - ${courseSession.webinarTool}`}
                    {courseSession.courseSubCategoryKey ===
                      CourseSubCategoryKey.FACE_TO_FACE && t('faceToFace')}
                  </div>
                  {!!courseSession.location && (
                    <div className="flex items-center border-r border-gray-200 px-2 text-caption font-semibold text-gray-650">
                      <Location className="mr-1 w-4 text-gray-300" />
                      <span>{courseSession.location}</span>
                    </div>
                  )}
                  <div className="flex items-center px-2 text-caption font-semibold text-gray-650">
                    <SoundUpGray className="mr-1 w-4" />
                    <span>
                      {courseSession.courseLanguage === CourseLanguage.ALL
                        ? 'EN/TH'
                        : courseSession.courseLanguage.toUpperCase()}
                    </span>
                  </div>
                </div>
                <SessionTimeSlotSelector
                  currentSession={courseSession}
                  relatedCourseSessions={relatedCourseSessions}
                />
                <div className="mt-4 flex flex-col space-y-3 lg:flex-row lg:items-center lg:space-y-0 lg:space-x-3">
                  <div>
                    <Button
                      variant="primary"
                      size="medium"
                      disabled={
                        !actionableStatuses.includes(
                          courseSession.sessionStatus,
                        )
                      }
                    >
                      <Link href={WEB_PATHS.SESSION_MANAGEMENT_BULK_UPLOAD}>
                        <a
                          className={cx(
                            'flex items-center',
                            !actionableStatuses.includes(
                              courseSession.sessionStatus,
                            ) && 'pointer-events-none',
                          )}
                        >
                          <Plus className="mr-2 w-4" />
                          <span>
                            {t('sessionParticipantManagementPage.bulkUpload')}
                          </span>
                        </a>
                      </Link>
                    </Button>
                  </div>
                  <div>
                    <Button
                      variant="secondary"
                      size="medium"
                      onClick={onClickAddRegistrant}
                      disabled={
                        !actionableStatuses.includes(
                          courseSession.sessionStatus,
                        )
                      }
                    >
                      <Plus className="mr-2 w-4" />
                      <span>
                        {t('sessionParticipantManagementPage.addRegistrant')}
                      </span>
                    </Button>
                  </div>
                  <div>
                    <Button
                      variant="secondary"
                      size="medium"
                      onClick={onClickExport}
                    >
                      <ExternalLink className="mr-2 w-4" />
                      <span>
                        {t('sessionParticipantManagementPage.export')}
                      </span>
                    </Button>
                  </div>
                  <div className="relative mt-8 self-center lg:mt-0 lg:w-1/4">
                    <DotsHorizontal
                      className="ml-2 cursor-pointer"
                      onClick={toggleAdditionMenu}
                    />
                    <div
                      className={cx(
                        'absolute top-full left-1/2 -translate-x-1/2 transform bg-white p-6 shadow lg:left-0 lg:translate-x-0',
                        {
                          hidden: !isOpenAdditionMenu,
                          block: isOpenAdditionMenu,
                        },
                      )}
                    >
                      <div
                        className={cx('flex items-center', {
                          'cursor-pointer text-black':
                            actionableStatuses.includes(
                              courseSession.sessionStatus,
                            ),
                          'cursor-not-allowed text-gray-400':
                            !actionableStatuses.includes(
                              courseSession.sessionStatus,
                            ),
                        })}
                        onClick={() => {
                          if (
                            actionableStatuses.includes(
                              courseSession.sessionStatus,
                            )
                          ) {
                            onClickEdit();
                            toggleAdditionMenu();
                          }
                        }}
                      >
                        <Pencil className="mr-2" />
                        <span className="whitespace-nowrap">
                          {t('sessionParticipantManagementPage.edit')}
                        </span>
                      </div>
                      <div
                        className={cx('mt-6 flex items-center', {
                          'cursor-pointer text-black':
                            sessionCancellableStatuses.includes(
                              courseSession.sessionStatus,
                            ),
                          'cursor-not-allowed text-gray-400':
                            !sessionCancellableStatuses.includes(
                              courseSession.sessionStatus,
                            ),
                        })}
                        onClick={() => {
                          if (
                            sessionCancellableStatuses.includes(
                              courseSession.sessionStatus,
                            )
                          ) {
                            onClickCancelSession();
                            toggleAdditionMenu();
                          }
                        }}
                      >
                        <Trash className="mr-2" />
                        <span className="whitespace-nowrap">
                          {t('sessionParticipantManagementPage.cancelSession')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default SessionHeader;
