import cx from 'classnames';
import { useEffect, useState } from 'react';
import API_PATHS from '../../constants/apiPaths';
import { centralHttp } from '../../http';
import { useLocaleText } from '../../i18n/useLocaleText';
import { BaseResponseDto } from '../../models/BaseResponse.dto';
import { User } from '../../models/user';
import { ChevronDown, ChevronUp } from '../../ui-kit/icons';
import Picture from '../../ui-kit/Picture';
import { SessionItem } from './SessionItem';
import {
  ISessionManagementCourse,
  ISessionManagementCourseOutline,
  ISessionsListFilters,
  transformFiltersToQuery,
} from './useSessionList';

interface ISessionsCourseItemProps {
  course: ISessionManagementCourse;
  initialIsShowing?: boolean;
  instructorsMap: { [userId: string]: User };
  sessionListFilters: ISessionsListFilters;
}

export const SessionsCourseItem = ({
  course,
  initialIsShowing = false,
  instructorsMap,
  sessionListFilters,
}: ISessionsCourseItemProps) => {
  const localeText = useLocaleText();
  const [isShowing, setIsShowing] = useState(initialIsShowing);
  const [sessionOutlines, setSessionOutlines] =
    useState<ISessionManagementCourseOutline[] | undefined>(undefined);

  useEffect(() => {
    if (sessionOutlines === undefined && isShowing) {
      centralHttp
        .get<
          BaseResponseDto<{ courseOutlines: ISessionManagementCourseOutline[] }>
        >(API_PATHS.COURSE_SESSIONS_MANAGEMENT_SESSIONS, {
          params: {
            ...transformFiltersToQuery(sessionListFilters),
            courseId: course.id,
          },
        })
        .then((res) => {
          setSessionOutlines(res.data.data.courseOutlines);
        })
        .catch((err) => {
          console.error(err);
        });
    }
  }, [sessionOutlines, isShowing]);

  const isLoading = sessionOutlines === undefined;

  return (
    <section className="rounded-2xl border border-gray-200">
      <a
        role="button"
        className={cx(
          'flex cursor-pointer items-center justify-between border-gray-200 bg-gray-100 p-4 text-caption font-semibold text-gray-650',
          {
            'rounded-2xl': !isShowing || isLoading,
            'rounded-tr-2xl rounded-tl-2xl border-b': isShowing && !isLoading,
          },
        )}
        onClick={() => setIsShowing((_) => !_)}
      >
        <span>
          {course.title} ({course.sessionCount} Session
          {course.sessionCount === 1 ? '' : 's'})
        </span>

        {isShowing ? (
          isLoading ? (
            <div className="loader h-6 w-6 animate-spin rounded-full border-2 border-gray-500" />
          ) : (
            <ChevronUp />
          )
        ) : (
          <ChevronDown />
        )}
      </a>
      {isShowing && (
        <div className="divide-y overflow-hidden">
          {sessionOutlines?.map((courseOutline) => (
            <section key={courseOutline.id} className="border-gray-200 p-6">
              <div className="flex items-center space-x-4">
                {course.imageKey ? (
                  <img
                    src={`${process.env.NEXT_PUBLIC_CDN_BASE_URL}/${course.imageKey}`}
                    className="h-12 w-12 object-cover object-center"
                  />
                ) : (
                  <Picture
                    className="h-12 w-12 rounded-lg object-cover object-center"
                    sources={[
                      {
                        srcSet: '/assets/course/course-default.webp',
                        type: 'image/webp',
                      },
                    ]}
                    fallbackImage={{ src: '/assets/course/course-default.png' }}
                  />
                )}

                <h3 className="text-subtitle font-semibold text-black">
                  {localeText(courseOutline.title)}
                </h3>
              </div>
              <div className="mt-4 grid max-h-180 grid-cols-4 gap-4 overflow-y-auto xl:grid-cols-5 2xl:grid-cols-6">
                {courseOutline.courseSessions.map((session) => (
                  <SessionItem
                    key={session.id}
                    session={session}
                    subCategory={courseOutline.subCategory}
                    instructorsMap={instructorsMap}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </section>
  );
};
