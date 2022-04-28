import Head from 'next/head';
import { useMemo } from 'react';
import pluralize from 'pluralize';

import Layout from '../layouts/main.layout';
import SearchSidebar from './SearchSidebar';
import useSearchResult from './useSearchResult';
import SearchResultList from './SearchResultList';
import useTranslation from '../i18n/useTranslation';
import MainNavbar from '../ui-kit/headers/MainNavbar';
import SearchResultFilters from './SearchResultFilters';
import { searchTypes } from '../ui-kit/headers/useSearchBar';
import useSearchResultFilters from './useSearchResultFilters';
import CourseFiltersSkeleton from '../shared/skeletons/CourseFiltersSkeleton';

function SearchResultPage({ token }) {
  const { t } = useTranslation();
  const {
    term,
    type,
    courseCategory,
    lineOfLearning,
    hasActiveFilters,
    handleClear,
  } = useSearchResultFilters();
  const { search, loading, results, totalResult, pagination, errors } =
    useSearchResult({
      itemsPerPage: 12,
    });

  const head = useMemo(
    () => (
      <Head>
        <title>
          {t('headerText')} | {t('searchResultPage.metaTitle')}
        </title>
      </Head>
    ),
    [],
  );

  return (
    <Layout
      head={head}
      header={<MainNavbar token={token} />}
      noMobilePadding={true}
    >
      <div className="px-6 lg:mx-auto lg:mb-8 lg:flex lg:w-256 lg:flex-col lg:justify-start">
        {!!term ? (
          <div className="sticky left-0 top-16 z-40 bg-white pb-8 pt-6 text-caption text-gray-500 lg:pt-8 lg:line-clamp-1">
            {totalResult > 0 ? (
              <span>{t('searchResultPage.resultOf')} </span>
            ) : (
              <span>{t('searchResultPage.noResultFound')} </span>
            )}
            <span className="font-bold">"{term}"</span>
            <span className="pl-2">
              ({totalResult || 0}{' '}
              {pluralize(t('searchResultPage.result'), totalResult || 1)})
            </span>
          </div>
        ) : (
          <div className="mb-8 text-caption font-bold text-gray-500">
            {t('searchResultPage.invalidSearchTerm')}
          </div>
        )}
        {!!term && (
          <div className="flex flex-col items-start justify-between lg:flex-row">
            <SearchSidebar
              coursesResultCount={results?.[searchTypes.COURSE]?.count}
              instructorsResultCount={results?.[searchTypes.INSTRUCTOR]?.count}
              learningTracksResultCount={
                results?.[searchTypes.LEARNING_TRACK]?.count
              }
              fourLineOfLearningsResultCount={
                results?.[searchTypes.LINE_OF_LEARNING]?.count
              }
            />
            <div className="box-content flex w-full flex-shrink flex-col lg:ml-5 lg:w-181">
              {type === searchTypes.COURSE ||
              type === searchTypes.LEARNING_TRACK ||
              type === searchTypes.LINE_OF_LEARNING ? (
                loading ? (
                  <CourseFiltersSkeleton />
                ) : (
                  <SearchResultFilters />
                )
              ) : null}
              <SearchResultList
                errors={errors}
                handleRetry={search}
                pagination={pagination}
                loading={loading}
                results={results?.[type]?.data || []}
                subType={courseCategory || lineOfLearning}
                type={type as any}
                hasFilters={hasActiveFilters}
                onClearFilter={handleClear}
              />
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default SearchResultPage;
