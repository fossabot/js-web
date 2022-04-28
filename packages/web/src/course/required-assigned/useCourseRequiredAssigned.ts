import cloneDeep from 'lodash/cloneDeep';
import { useRouter } from 'next/router';
import { stringifyUrl } from 'query-string';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { unstable_batchedUpdates } from 'react-dom';
import API_PATHS from '../../constants/apiPaths';
import WEB_PATHS from '../../constants/webPaths';
import { centralHttp } from '../../http';
import { BaseResponseDto } from '../../models/BaseResponse.dto';
import IPaginationParams from '../../models/IPaginationParams';
import { UserAssignedCourse } from '../../models/userAssignedCourse';

export interface IUserAssignedCoursesListFilters {
  search: string | undefined;
  page: number;
  order:
    | 'courseTitle'
    | 'email'
    | 'group'
    | 'org'
    | 'type'
    | 'createdDate'
    | 'expiryDate'
    | undefined;
  orderBy: 'ASC' | 'DESC' | undefined;
  perPage: number;
}

export const initialListFilters: IUserAssignedCoursesListFilters = {
  search: '',
  page: 1,
  order: undefined,
  orderBy: undefined,
  perPage: 20,
};

export const transformFiltersToQuery = (
  filters: IUserAssignedCoursesListFilters,
) => {
  const { search, ..._filters } = filters;
  const params: any = { ..._filters };

  if (search?.trim().length > 0) {
    params.search = search.trim();
  }
  return params;
};

export const useCourseRequiredAssigned = () => {
  const router = useRouter();

  const [userAssignedCourses, setUserAssignedCourses] =
    useState<UserAssignedCourse[] | undefined>(undefined);
  const [pagination, setPagination] =
    useState<IPaginationParams | undefined>(undefined);
  const [selectedUserAssignedCourses, setSelectedUserAssignedCourses] =
    useState<{ [id: string]: true }>({});

  const [userAssignedCoursesFilter, setUserAssignedCoursesFilter] =
    useState<IUserAssignedCoursesListFilters>(cloneDeep(initialListFilters));

  const fetchUserAssignedCourses = useCallback(
    async (filters: IUserAssignedCoursesListFilters) => {
      try {
        const res = await centralHttp.get<
          BaseResponseDto<UserAssignedCourse[]>
        >(API_PATHS.USER_ASSIGNED_COURSES, {
          params: transformFiltersToQuery(filters),
        });
        unstable_batchedUpdates(() => {
          setUserAssignedCourses(res.data.data);
          setPagination(res.data.pagination);
        });
      } catch (err) {
        console.error(err);
      }
    },
    [],
  );

  useEffect(() => {
    const { search, order, orderBy, page, perPage } = router.query;
    const valuesFromQuery = cloneDeep(initialListFilters);

    if (search) {
      valuesFromQuery.search = String(search);
    }

    if (order) {
      valuesFromQuery.order = order as IUserAssignedCoursesListFilters['order'];
      valuesFromQuery.orderBy =
        (String(orderBy) as IUserAssignedCoursesListFilters['orderBy']) ||
        'ASC';
    }

    if (page) {
      try {
        const _page = Number(page);
        if (_page > 0) {
          valuesFromQuery.page = _page;
        }
      } catch (err) {
        console.error(err);
      }
    }

    if (perPage) {
      try {
        const _perPage = Number(perPage);
        if (_perPage > 0) {
          valuesFromQuery.perPage = _perPage;
        }
      } catch (err) {
        console.error(err);
      }
    }

    setUserAssignedCoursesFilter(valuesFromQuery);
    fetchUserAssignedCourses(valuesFromQuery);
  }, [fetchUserAssignedCourses, router.query]);

  const userAssignedCoursesFilterRef = useRef(userAssignedCoursesFilter);

  useEffect(() => {
    userAssignedCoursesFilterRef.current = userAssignedCoursesFilter;
  }, [userAssignedCoursesFilter]);

  const onChangeFilter = useCallback(
    (
      getQuery: (
        query: IUserAssignedCoursesListFilters,
      ) => Partial<IUserAssignedCoursesListFilters>,
    ) => {
      const query = getQuery(userAssignedCoursesFilterRef.current);

      if (query.page === 1) query.page = undefined;

      if (query.search?.trim().length === 0) query.search = undefined;

      router.push(
        stringifyUrl({
          url: WEB_PATHS.COURSE_REQUIRED_ASSIGNED,
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

  const areAllUserAssignedCoursesSelected = useMemo(() => {
    if (!userAssignedCourses) return false;

    if (
      userAssignedCourses.length !== 0 &&
      userAssignedCourses.length !==
        Object.keys(selectedUserAssignedCourses).length
    )
      return false;

    for (const item of userAssignedCourses) {
      if (!selectedUserAssignedCourses[item.id]) {
        return false;
      }
    }

    return true;
  }, [userAssignedCourses, selectedUserAssignedCourses]);

  const onRefresh = useCallback(() => {
    fetchUserAssignedCourses(userAssignedCoursesFilterRef.current);
  }, [fetchUserAssignedCourses]);

  return {
    onChangeFilter,
    userAssignedCoursesFilter,
    userAssignedCourses,
    pagination,
    selectedUserAssignedCourses,
    setSelectedUserAssignedCourses,
    areAllUserAssignedCoursesSelected,
    onRefresh,
  };
};
