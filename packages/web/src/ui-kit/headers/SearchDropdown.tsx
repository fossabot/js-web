import React from 'react';
import cx from 'classnames';

import { searchTypes } from './useSearchBar';
import useTranslation from '../../i18n/useTranslation';
import {
  ArrowRight,
  Book,
  History,
  LearningTrack,
  Person,
  Search,
} from '../icons';

interface ISearchDropdownProps {
  isFocused: boolean;
  searchTerm: string;
  hasEmptyResult: boolean;
  openSearchResult: (val1: string, val2?: string) => void;
  userSearchHistories: any[];
  searchRecommendations: any[];
  handleSubmit: () => void;
}

function CTAItem({ item, hasSuggestionSection, searchTerm, openSearchResult }) {
  return (
    <li
      className={cx('flex flex-col justify-start pt-2 pb-5 last:pb-3', {
        'first:pt-0': !hasSuggestionSection,
      })}
    >
      <div className="flex flex-row items-center justify-start py-2 pl-0.5">
        <item.TitleIcon className="mr-2 h-4 w-4 text-gray-400" />
        <span className="text-footnote text-gray-500">{item.title}</span>
      </div>
      <div
        onClick={() => openSearchResult(searchTerm.trim(), item.type)}
        className="flex cursor-pointer flex-row items-center justify-start pt-3 pl-2"
      >
        <ArrowRight className="mr-2 h-4 w-4 text-gray-400" />
        <span className="text-caption font-bold text-brand-primary">
          {item.searchTextCaption}
        </span>
      </div>
    </li>
  );
}

function SearchHistoryItem({ item, openSearchResult }) {
  return (
    <div
      onClick={() => openSearchResult(item.term, item.type)}
      className="flex w-full cursor-pointer flex-row items-center justify-start rounded-lg py-14px px-2 last:ml-0.5 hover:bg-gray-200"
    >
      <History className="min-w-4 h-4 w-4 text-gray-500" />
      <span className="ml-2 flex-1 text-caption line-clamp-1">{item.term}</span>
    </div>
  );
}

function RecommendationItem({ item, openSearchResult }) {
  return (
    <div
      onClick={() => openSearchResult(item.term, item.type)}
      className="flex w-full cursor-pointer flex-row items-center justify-start rounded-lg py-14px px-2 last:ml-0.5 hover:bg-gray-200"
    >
      <Search className="min-w-4 h-4 w-4 text-gray-500" />
      <span className="ml-2 flex-1 text-caption line-clamp-1">{item.term}</span>
    </div>
  );
}

const SearchDropdown = ({
  isFocused,
  searchTerm,
  hasEmptyResult,
  openSearchResult,
  userSearchHistories,
  searchRecommendations,
  handleSubmit,
}: ISearchDropdownProps) => {
  const { t } = useTranslation();

  const hasSuggestionSection =
    userSearchHistories.length > 0 ||
    searchRecommendations.length > 0 ||
    (searchTerm && hasEmptyResult);

  const CTAItems = [
    {
      title: t('searchBar.courseTitle'),
      TitleIcon: Book,
      searchTextCaption: t('searchBar.searchTextCaptionCourse'),
      type: searchTypes.COURSE,
    },
    {
      title: t('searchBar.learningTrackTitle'),
      TitleIcon: LearningTrack,
      searchTextCaption: t('searchBar.searchTextCaptionlearningTrack'),
      type: searchTypes.LEARNING_TRACK,
    },
    {
      title: t('searchBar.instructorTitle'),
      TitleIcon: Person,
      searchTextCaption: t('searchBar.searchTextCaptionInstructor'),
      type: searchTypes.INSTRUCTOR,
    },
  ];

  return (
    <div
      className={cx(
        'absolute left-0 top-full z-50 max-h-100 w-full overflow-y-scroll rounded-lg bg-white shadow-sm lg:mt-2 lg:w-275px lg:overflow-y-auto xl:w-400px',
        { hidden: !isFocused },
      )}
    >
      <ul className="flex flex-col divide-y divide-gray-200 p-4">
        {searchTerm.trim().length === 0 && userSearchHistories.length > 0 ? (
          <li className="flex flex-col justify-start pb-2">
            {userSearchHistories.map((item, index) => (
              <SearchHistoryItem
                key={index}
                item={item}
                openSearchResult={openSearchResult}
              />
            ))}
          </li>
        ) : null}
        {searchTerm.trim().length > 0 && searchRecommendations.length > 0 ? (
          <li className="flex flex-col justify-start pb-2">
            {searchRecommendations.map((item, index) => (
              <RecommendationItem
                key={index}
                item={item}
                openSearchResult={openSearchResult}
              />
            ))}
          </li>
        ) : null}
        {searchTerm.trim().length > 0 && hasEmptyResult ? (
          <li className="flex px-2 pt-3 pb-5">
            <div
              className="flex-1 cursor-pointer break-all text-caption line-clamp-1"
              onClick={handleSubmit}
            >
              {t('searchBar.searchFor')} "{searchTerm.trim()}"
            </div>
          </li>
        ) : null}
        {CTAItems.map((item, index) => (
          <CTAItem
            key={index}
            item={item}
            searchTerm={searchTerm}
            openSearchResult={openSearchResult}
            hasSuggestionSection={hasSuggestionSection}
          />
        ))}
      </ul>
    </div>
  );
};

export default SearchDropdown;
