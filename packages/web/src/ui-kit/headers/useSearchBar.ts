import { useFormik } from 'formik';
import debounce from 'lodash/debounce';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';

import { centralHttp } from '../../http';
import API_PATHS from '../../constants/apiPaths';
import WEB_PATHS from '../../constants/webPaths';
import {
  getSelectedLang,
  redirectToPathWithLocale,
} from '../../i18n/lang-utils';

interface ISearch {
  search: string;
}

export const searchTypes = {
  COURSE: 'course',
  LEARNING_TRACK: 'learningTrack',
  INSTRUCTOR: 'instructor',
  LINE_OF_LEARNING: 'lineOfLearning',
};

let localSearchHistoryData = [];

export default function useSearchBar(props: { showSearch: boolean }) {
  const [isFocused, setIsFocused] = useState(false);
  const [hasEmptyResult, setHasEmptyResult] = useState(false);
  const [userSearchHistories, setUserSearchHistories] = useState([]);
  const [searchRecommendations, setSearchRecommendations] = useState([]);
  const [shouldTriggerRefFocus, setShouldTriggerRefFocus] = useState(false);
  const router = useRouter();

  const handleSearchSubmit = (value: ISearch) => {
    openSearchResult(value.search);
  };

  const fetchUserSearchHistories = async () => {
    try {
      const { data } = await centralHttp.get(API_PATHS.MY_SEARCH_HISTORIES);
      setUserSearchHistories(data.data);
      localSearchHistoryData = data.data;
    } catch (e) {
      console.error(e);
    }
  };

  const formik = useFormik<ISearch>({
    initialValues: { search: '' },
    onSubmit: handleSearchSubmit,
  });

  useEffect(() => {
    if (props.showSearch) {
      setIsFocused(true);
      setShouldTriggerRefFocus(true);
    }
  }, [props.showSearch]);

  useEffect(() => {
    if (localSearchHistoryData.length > 0) {
      setUserSearchHistories(localSearchHistoryData);
      return;
    }

    fetchUserSearchHistories();
  }, []);

  useEffect(() => {
    if (router.query.term) {
      formik.setFieldValue('search', router.query.term);
    }
  }, [router.query.term]);

  const saveSearchHistory = async (term: string, type: string) => {
    try {
      await centralHttp.post(API_PATHS.MY_SEARCH_HISTORIES, { term, type });
      localSearchHistoryData = [];
    } catch (e) {
      console.error(e);
    }
  };

  const openSearchResult = async (term: string, type = searchTypes.COURSE) => {
    if (!term || term.trim().length <= 0) {
      return;
    }

    saveSearchHistory(term, type);
    await formik.setFieldValue('search', term);

    const path = `${WEB_PATHS.SEARCH}?type=${type}&term=${term}`;

    if (router.pathname === WEB_PATHS.SEARCH) {
      redirectToPathWithLocale(getSelectedLang(), path);
      return;
    }

    router.push(path);
  };

  const suggest = async (term: string) => {
    const { data } = await centralHttp.get(API_PATHS.SEARCH_SUGGEST, {
      params: { term: term.trim() },
    });

    if (data.data?.length > 0) {
      setHasEmptyResult(false);
      setSearchRecommendations(data.data);
    } else {
      setHasEmptyResult(true);
      setSearchRecommendations([]);
    }
  };

  const debouncedSuggest = useCallback(
    debounce((term) => suggest(term), 400),
    [],
  );

  const handleChange = async (e: any) => {
    formik.handleChange(e);

    if (e.target.value.trim().length > 0) {
      debouncedSuggest(e.target.value);
    } else {
      setHasEmptyResult(false);
      setSearchRecommendations([]);
    }
  };

  const clearSearch = async () => {
    await formik.setFieldValue('search', '');
    setSearchRecommendations([]);
    setHasEmptyResult(false);
    setTimeout(() => setShouldTriggerRefFocus(true), 155);
  };

  return {
    formik,
    isFocused,
    clearSearch,
    setIsFocused,
    handleChange,
    hasEmptyResult,
    openSearchResult,
    userSearchHistories,
    searchRecommendations,
    shouldTriggerRefFocus,
    setShouldTriggerRefFocus,
  };
}
