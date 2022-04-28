import Link from 'next/link';
import { stringifyUrl } from 'query-string';
import { useCallback, useEffect, useMemo, useState } from 'react';
import CourseItem from '../../catalog/components/CourseItem';
import API_PATHS from '../../constants/apiPaths';
import WEB_PATHS from '../../constants/webPaths';
import { useResponsive } from '../../hooks/useResponsive';
import { centralHttp } from '../../http';
import useTranslation from '../../i18n/useTranslation';
import LearningTrackItem from '../../learning-track/LearningTrackItem';
import { BaseResponseDto } from '../../models/BaseResponse.dto';
import {
  CourseCategory,
  CourseCategoryKey,
  UserEnrolledCourseRaw,
} from '../../models/course';
import { UserEnrolledLearningTrackRaw } from '../../models/learningTrack';
import { UserAssignedCourseType } from '../../models/userAssignedCourse';
import {
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Flag,
  Thumb,
} from '../../ui-kit/icons';
import Picture from '../../ui-kit/Picture';
import { ITabsProps, Tabs } from '../../ui-kit/tabs/Tabs';
import { dateToUTCDate } from '../../utils/date';
import { CourseGallerySkeleton } from './CourseGallerySkeleton';
import { every } from 'lodash';

const MAX_COURSES = 8;

export const AssignedRequiredItems = () => {
  const [activeTab, setActiveTab] = useState(UserAssignedCourseType.Required);
  const { t } = useTranslation();
  const { lg } = useResponsive();

  const [requiredCourses, setRequiredCourses] =
    useState<UserEnrolledCourseRaw[] | undefined>(undefined);
  const [assignedItems, setAssignedItems] =
    useState<
      (UserEnrolledCourseRaw | UserEnrolledLearningTrackRaw)[] | undefined
    >(undefined);
  const [showMore, setShowMore] = useState(false);

  const fetchCourses = useCallback(async (type: UserAssignedCourseType) => {
    const res = await centralHttp.get<BaseResponseDto<UserEnrolledCourseRaw[]>>(
      API_PATHS.ENROLLED_COURSES,
      {
        params: { perPage: MAX_COURSES, assignmentType: type },
      },
    );
    setRequiredCourses(res.data.data);
  }, []);

  const fetchAssignedItems = useCallback(async () => {
    const courseRes = await centralHttp.get<
      BaseResponseDto<UserEnrolledCourseRaw[]>
    >(API_PATHS.ENROLLED_COURSES, {
      params: {
        perPage: MAX_COURSES,
        assignmentType: UserAssignedCourseType.Optional,
      },
    });

    const ltRes = await centralHttp.get<
      BaseResponseDto<UserEnrolledLearningTrackRaw[]>
    >(API_PATHS.ENROLLED_LEARNING_TRACKS, {
      params: { perPage: MAX_COURSES },
    });

    const all = [...courseRes.data.data, ...ltRes.data.data]
      .sort((a, b) => {
        if (!a.dueDateTime && !b.dueDateTime) return 0;
        if (a.dueDateTime && !b.dueDateTime) return -1;
        if (!a.dueDateTime && b.dueDateTime) return 1;
        return (
          dateToUTCDate(a.dueDateTime).getTime() -
          dateToUTCDate(b.dueDateTime).getTime()
        );
      })
      .slice(0, MAX_COURSES);

    setAssignedItems(all);
  }, []);

  useEffect(() => {
    fetchCourses(UserAssignedCourseType.Required);
    fetchAssignedItems();
  }, [fetchCourses, fetchAssignedItems]);

  useEffect(() => {
    if (requiredCourses !== undefined && assignedItems !== undefined) {
      if (requiredCourses.length === 0 && assignedItems.length > 0) {
        setActiveTab(UserAssignedCourseType.Optional);
      }
    }
  }, [assignedItems, requiredCourses]);

  const renderTabItem =
    ({ activeIcon, inactiveIcon, text }) =>
    // eslint-disable-next-line react/display-name
    ({ active }: { active: boolean }) => {
      const ActiveIcon = activeIcon;
      const InactiveIcon = inactiveIcon;
      return (
        <div className="flex space-x-2">
          {active ? <ActiveIcon /> : <InactiveIcon />}
          <span className="text-caption">{text}</span>
        </div>
      );
    };

  const tabOptions = useMemo(() => {
    const options: ITabsProps['items'] = [];
    if (requiredCourses && requiredCourses.length > 0) {
      options.push({
        key: UserAssignedCourseType.Required,
        render: renderTabItem({
          activeIcon: Flag,
          inactiveIcon: Flag,
          text: t('courseItem.required'),
        }),
      });
    }
    if (assignedItems && assignedItems.length > 0) {
      options.push({
        key: UserAssignedCourseType.Optional,
        render: renderTabItem({
          activeIcon: Thumb,
          inactiveIcon: Thumb,
          text: t('courseItem.assigned'),
        }),
      });
    }

    return options;
  }, [assignedItems, requiredCourses, t]);

  const courses =
    activeTab === UserAssignedCourseType.Required
      ? requiredCourses
      : assignedItems;

  if (requiredCourses === undefined || assignedItems === undefined)
    return <CourseGallerySkeleton />;

  if (
    requiredCourses !== undefined &&
    assignedItems !== undefined &&
    requiredCourses.length === 0 &&
    assignedItems.length === 0
  )
    return null;

  return (
    <>
      <div className="mt-8 lg:mt-12">
        <div className="mt-6 flex flex-col justify-between lg:mt-15 lg:flex-row">
          <div className="mx-6 mb-6 flex items-center space-x-4 lg:mx-0 lg:mb-0">
            <h5 className="text-subtitle font-semibold text-gray-900">
              {t('dashboardHomePage.requiredAssigned')}
            </h5>
          </div>

          <Tabs
            rounded={lg}
            className="w-full lg:w-auto"
            active={activeTab}
            onClick={(tab) => setActiveTab(tab as UserAssignedCourseType)}
            items={tabOptions}
          />
        </div>
      </div>
      {courses?.length === 0 && (
        <div className="mt-10 flex w-full flex-col items-center justify-center bg-gray-100 p-26">
          <Picture
            sources={[
              {
                srcSet: '/assets/course/course-placeholder.webp',
                type: 'image/webp',
              },
            ]}
            fallbackImage={{ src: '/assets/course/course-placeholder.png' }}
          />
          <div className="mt-6 font-semibold text-black">
            {t(
              activeTab === UserAssignedCourseType.Required
                ? 'dashboardHomePage.noRequiredCourses'
                : 'dashboardHomePage.noAssignedCourses',
            )}
          </div>
        </div>
      )}
      {courses && courses.length > 0 && (
        <div className="mt-6 mb-12 grid grid-cols-1 justify-center gap-y-6 lg:mt-12 lg:grid-cols-4 lg:gap-x-8">
          {courses
            ?.slice(
              0,
              lg ? MAX_COURSES : showMore ? MAX_COURSES : MAX_COURSES / 2,
            )
            .map((item) => {
              if (isAssignedCourse(item)) {
                return (
                  <div key={item.id} className="flex justify-center">
                    <CourseItem
                      course={{
                        ...item,
                        userAssignedCourse: [
                          { assignmentType: item.userAssignedCourseType },
                        ],
                      }}
                    />
                  </div>
                );
              } else {
                const lt: UserEnrolledLearningTrackRaw = item;
                return (
                  <div key={lt.id} className="flex justify-center">
                    <LearningTrackItem
                      learningTrack={{
                        ...lt,
                        isFeatured: false,
                        category: {
                          key: lt.categoryKey,
                        } as CourseCategory<CourseCategoryKey>,
                        userAssignedLearningTrack: [
                          {
                            assignmentType: lt.userAssignedLearningTrackType,
                          },
                        ],
                      }}
                    />
                  </div>
                );
              }
            })}

          {(courses?.length || 0) > MAX_COURSES / 2 && (
            <div className="flex justify-center lg:hidden">
              <a
                role="button"
                className="flex items-center space-x-2 text-caption font-semibold text-brand-primary"
                onClick={() => setShowMore((_) => !_)}
              >
                <span>
                  {t(`dashboardHomePage.${showMore ? 'showLess' : 'showMore'}`)}
                </span>
                {showMore ? <ChevronUp /> : <ChevronDown />}
              </a>
            </div>
          )}
        </div>
      )}
      {courses?.length > 0 && (
        <div className="flex justify-center">
          <Link
            href={stringifyUrl({
              url: every(courses, (course) => isLearningTrack(course))
                ? WEB_PATHS.DASHBOARD_LEARNING_TRACKS
                : WEB_PATHS.DASHBOARD_COURSES,
              query: {
                orderBy:
                  activeTab === UserAssignedCourseType.Optional
                    ? 'assignedCourse'
                    : 'requiredCourse',
              },
            })}
          >
            <a className="flex items-center space-x-2 text-caption font-semibold text-brand-primary">
              <span>{t('dashboardHomePage.seeAll')}</span>
              <ArrowRight />
            </a>
          </Link>
        </div>
      )}
      <div className="mt-8 h-px w-full bg-gray-200"></div>
    </>
  );
};

function isAssignedCourse(
  data: UserEnrolledCourseRaw | UserEnrolledLearningTrackRaw,
): data is UserEnrolledCourseRaw {
  return (data as UserEnrolledCourseRaw).userAssignedCourseType !== undefined;
}

function isLearningTrack(
  data: UserEnrolledCourseRaw | UserEnrolledLearningTrackRaw,
) {
  return (data as UserEnrolledCourseRaw).availableLanguage === undefined;
}
