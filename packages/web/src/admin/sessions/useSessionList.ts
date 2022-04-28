import { endOfDay, startOfDay } from 'date-fns';
import cloneDeep from 'lodash/cloneDeep';
import isEqual from 'lodash/isEqual';
import { useRouter } from 'next/router';
import { stringifyUrl } from 'query-string';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { unstable_batchedUpdates } from 'react-dom';
import API_PATHS from '../../constants/apiPaths';
import WEB_PATHS from '../../constants/webPaths';
import { centralHttp } from '../../http';
import { BaseResponseDto } from '../../models/BaseResponse.dto';
import {
  CourseSubCategoryKey,
  ICourse,
  ICourseOutline,
  ICourseSession,
} from '../../models/course';
import IPaginationParams from '../../models/IPaginationParams';
import { User } from '../../models/user';
import { isValidUUID } from '../../utils/uuid';

export enum SessionStatus {
  NOT_STARTED = 'not-started',
  IN_PROGRESS = 'in-progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export interface ISessionsListFilters {
  startTime: Date;
  endTime: Date;
  type:
    | CourseSubCategoryKey.FACE_TO_FACE
    | CourseSubCategoryKey.VIRTUAL
    | undefined;
  status: SessionStatus | undefined;
  instructorId: string | undefined;
  search: string | undefined;
  page: number;
}

export interface ISessionManagementCourse {
  id: ICourse['id'];
  title: ICourse['title'];
  imageKey: ICourse['imageKey'];
  sessionCount: number;
}

export interface ISessionManagementCourseOutline {
  id: ICourseOutline['id'];
  title: ICourseOutline['title'];
  subCategory: CourseSubCategoryKey.VIRTUAL | CourseSubCategoryKey.FACE_TO_FACE;
  courseSessions: {
    id: ICourseSession['id'];
    startTime: ICourseSession['startDateTime'];
    endTime: ICourseSession['endDateTime'];
    booked: number;
    seats: number;
    instructorIds: string[];
    cancelled: boolean;
  }[];
}

export const initialListFilters: ISessionsListFilters = {
  startTime: startOfDay(new Date()),
  endTime: startOfDay(new Date()),
  type: undefined,
  status: undefined,
  instructorId: undefined,
  search: '',
  page: 1,
};

export const transformFiltersToQuery = (filters: ISessionsListFilters) => {
  const { instructorId, search, ..._filters } = filters;
  const params: any = { ..._filters };
  if (instructorId) {
    params.instructorIds = [instructorId];
  }
  if (search?.trim().length > 0) {
    params.search = search.trim();
  }
  params.endTime = endOfDay(filters.endTime);
  return params;
};

export const useSessionsList = () => {
  const router = useRouter();
  const [totalSessions, setTotalSessions] =
    useState<number | undefined>(undefined);
  const [sessionCourses, setSessionCourses] =
    useState<ISessionManagementCourse[] | undefined>(undefined);
  const [pagination, setPagination] =
    useState<IPaginationParams | undefined>(undefined);
  const [instructors, setInstructors] = useState<User[]>([]);

  const [sessionListFilters, setSessionListFilters] =
    useState<ISessionsListFilters>(cloneDeep(initialListFilters));

  const fetchCourseSessions = useCallback(
    async (filters: ISessionsListFilters) => {
      unstable_batchedUpdates(() => {
        setTotalSessions(undefined);
        setSessionCourses(undefined);
        setPagination(undefined);
      });
      try {
        const res = await centralHttp.get<
          BaseResponseDto<{
            courses: ISessionManagementCourse[];
            totalSessionCount: number;
          }>
        >(API_PATHS.COURSE_SESSIONS_MANAGEMENT_COURSES, {
          params: transformFiltersToQuery(filters),
        });
        unstable_batchedUpdates(() => {
          setSessionCourses(res.data.data.courses);
          setTotalSessions(res.data.data.totalSessionCount);
          setPagination(res.data.pagination);
        });
      } catch (err) {
        console.error(err);
      }
    },
    [],
  );

  useEffect(() => {
    const valuesFromQuery = cloneDeep(initialListFilters);

    if (router.query.startTime) {
      try {
        const startTime = new Date(String(router.query.startTime));
        valuesFromQuery.startTime = startTime;
      } catch (err) {
        //
      }
    }

    if (router.query.endTime) {
      try {
        const endTime = new Date(String(router.query.endTime));
        valuesFromQuery.endTime = endTime;
      } catch (err) {
        //
      }
    }

    if (
      router.query.type &&
      (router.query.type === CourseSubCategoryKey.FACE_TO_FACE ||
        router.query.type === CourseSubCategoryKey.VIRTUAL)
    ) {
      valuesFromQuery.type = router.query.type;
    }

    if (
      router.query.status &&
      (router.query.status === SessionStatus.NOT_STARTED ||
        router.query.status === SessionStatus.IN_PROGRESS ||
        router.query.status === SessionStatus.COMPLETED ||
        router.query.status === SessionStatus.CANCELLED)
    ) {
      valuesFromQuery.status = router.query.status;
    }

    if (
      router.query.instructorId &&
      isValidUUID(String(router.query.instructorId))
    ) {
      valuesFromQuery.instructorId = String(router.query.instructorId);
    }

    if (router.query.search) {
      valuesFromQuery.search = String(router.query.search);
    }

    if (router.query.page) {
      try {
        const page = Number(router.query.page);
        if (page > 0) {
          valuesFromQuery.page = page;
        }
      } catch (err) {
        //
      }
    }

    setSessionListFilters(valuesFromQuery);
    fetchCourseSessions(valuesFromQuery);
  }, [fetchCourseSessions, router.query]);

  const sessionListFiltersRef = useRef(sessionListFilters);

  useEffect(() => {
    sessionListFiltersRef.current = sessionListFilters;
  }, [sessionListFilters]);

  const onChangeFilter = useCallback(
    (
      getQuery: (query: ISessionsListFilters) => Partial<ISessionsListFilters>,
    ) => {
      const query = getQuery(sessionListFiltersRef.current);

      if (isEqual(query.startTime, startOfDay(new Date())))
        query.startTime = undefined;

      if (isEqual(query.endTime, startOfDay(new Date())))
        query.endTime = undefined;

      if (query.page === 1) query.page = undefined;

      if (query.search?.trim().length === 0) query.search = undefined;

      router.push(
        stringifyUrl({
          url: WEB_PATHS.SESSION_MANAGEMENT,
          query: JSON.parse(JSON.stringify(query)),
        }),
        undefined,
        {
          shallow: true,
        },
      );
    },
    [router],
  );

  useEffect(() => {
    centralHttp
      .get<BaseResponseDto<User[]>>(API_PATHS.INSTRUCTORS)
      .then((res) => {
        setInstructors(res.data.data);
      });
  }, []);

  const instructorsMap = useMemo<{ [userId: string]: User }>(() => {
    return instructors.reduce((acc, curr) => {
      acc[curr.id] = curr;
      return acc;
    }, {});
  }, [instructors]);

  return {
    sessionListFilters,
    onChangeFilter,
    sessionCourses,
    pagination,
    totalSessions,
    instructors,
    instructorsMap,
  };
};
