import cloneDeep from 'lodash/cloneDeep';
import { useRouter } from 'next/router';
import { stringifyUrl } from 'query-string';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { unstable_batchedUpdates } from 'react-dom';
import API_PATHS from '../../../constants/apiPaths';
import WEB_PATHS from '../../../constants/webPaths';
import { centralHttp } from '../../../http';
import { BaseResponseDto } from '../../../models/BaseResponse.dto';
import IPaginationParams from '../../../models/IPaginationParams';
import { UserAssignedLearningTrack } from '../../../models/userAssignedLearningTrack';

export interface ILearningTrackAssignedListFilters {
  search: string | undefined;
  page: number;
  order:
    | 'learningTrackTitle'
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

export const initialListFilters: ILearningTrackAssignedListFilters = {
  search: '',
  page: 1,
  order: undefined,
  orderBy: undefined,
  perPage: 20,
};

export const transformFiltersToQuery = (
  filters: ILearningTrackAssignedListFilters,
) => {
  const { search, ..._filters } = filters;
  const params: any = { ..._filters };

  if (search?.trim().length > 0) {
    params.search = search.trim();
  }
  return params;
};

export const useLearningTrackAssigned = () => {
  const router = useRouter();

  const [userAssignedLearningTracks, setUserAssignedLearningTracks] =
    useState<UserAssignedLearningTrack[] | undefined>(undefined);
  const [pagination, setPagination] =
    useState<IPaginationParams | undefined>(undefined);
  const [
    selectedUserAssignedLearningTracks,
    setSelectedUserAssignedLearningTracks,
  ] = useState<{ [id: string]: true }>({});

  const [
    userAssignedLearningTracksFilter,
    setUserAssignedLearningTracksFilter,
  ] = useState<ILearningTrackAssignedListFilters>(
    cloneDeep(initialListFilters),
  );

  const fetchUserAssignedLearningTracks = useCallback(
    async (filters: ILearningTrackAssignedListFilters) => {
      try {
        const res = await centralHttp.get<
          BaseResponseDto<UserAssignedLearningTrack[]>
        >(API_PATHS.USER_ASSIGNED_LEARNING_TRACK, {
          params: transformFiltersToQuery(filters),
        });
        unstable_batchedUpdates(() => {
          setUserAssignedLearningTracks(res.data.data);
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
      valuesFromQuery.order =
        order as ILearningTrackAssignedListFilters['order'];
      valuesFromQuery.orderBy =
        (String(orderBy) as ILearningTrackAssignedListFilters['orderBy']) ||
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

    setUserAssignedLearningTracksFilter(valuesFromQuery);
    fetchUserAssignedLearningTracks(valuesFromQuery);
  }, [fetchUserAssignedLearningTracks, router.query]);

  const userAssignedLearningTracksFilterRef = useRef(
    userAssignedLearningTracksFilter,
  );

  useEffect(() => {
    userAssignedLearningTracksFilterRef.current =
      userAssignedLearningTracksFilter;
  }, [userAssignedLearningTracksFilter]);

  const onChangeFilter = useCallback(
    (
      getQuery: (
        query: ILearningTrackAssignedListFilters,
      ) => Partial<ILearningTrackAssignedListFilters>,
    ) => {
      const query = getQuery(userAssignedLearningTracksFilterRef.current);

      if (query.page === 1) query.page = undefined;

      if (query.search?.trim().length === 0) query.search = undefined;

      router.push(
        stringifyUrl({
          url: WEB_PATHS.LEARNING_TRACK_ASSIGNED,
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

  const areAllUserAssignedLearningTracksSelected = useMemo(() => {
    if (!userAssignedLearningTracks) return false;

    if (
      userAssignedLearningTracks.length !== 0 &&
      userAssignedLearningTracks.length !==
        Object.keys(selectedUserAssignedLearningTracks).length
    )
      return false;

    for (const item of userAssignedLearningTracks) {
      if (!selectedUserAssignedLearningTracks[item.id]) {
        return false;
      }
    }

    return true;
  }, [userAssignedLearningTracks, selectedUserAssignedLearningTracks]);

  const onRefresh = useCallback(() => {
    fetchUserAssignedLearningTracks(
      userAssignedLearningTracksFilterRef.current,
    );
  }, [fetchUserAssignedLearningTracks]);

  return {
    onChangeFilter,
    userAssignedLearningTracksFilter,
    userAssignedLearningTracks,
    pagination,
    selectedUserAssignedLearningTracks,
    setSelectedUserAssignedLearningTracks,
    areAllUserAssignedLearningTracksSelected,
    onRefresh,
  };
};
