import React, { useEffect, useRef } from 'react';
import cx from 'classnames';

import InputField from '../InputField';
import SearchDropdown from './SearchDropdown';
import { CloseCircle, Search } from '../icons';

interface ISearchFieldProps {
  formik: any;
  className?: string;
  shouldTriggerRefFocus: boolean;
  setShouldTriggerRefFocus: (val: boolean) => void;
  isFocused: boolean;
  openSearchResult: (val1: string, val2?: string) => void;
  setIsFocused: (val: boolean) => void;
  clearSearch: () => Promise<void>;
  handleChange: (e: any) => Promise<void>;
  userSearchHistories: any[];
  searchRecommendations: any[];
  hasEmptyResult: boolean;
}

const SearchBar = ({
  formik,
  className,
  isFocused,
  clearSearch,
  handleChange,
  setIsFocused,
  hasEmptyResult,
  openSearchResult,
  shouldTriggerRefFocus,
  userSearchHistories,
  searchRecommendations,
  setShouldTriggerRefFocus,
}: ISearchFieldProps) => {
  const searchFieldRef = useRef(null);

  useEffect(() => {
    if (shouldTriggerRefFocus) {
      searchFieldRef.current?.focus();
      setShouldTriggerRefFocus(false);
    }
  }, [shouldTriggerRefFocus]);

  return (
    <div className={cx('text-black lg:relative', className)}>
      <form
        onSubmit={formik.handleSubmit}
        autoComplete="off"
        className={cx(
          'opacity-1 w-full overflow-hidden transition-all duration-300 ease-in-out lg:w-275px xl:w-400px',
        )}
      >
        <InputField
          inputRef={searchFieldRef}
          formik={formik}
          name="search"
          value={formik.values.search}
          onBlur={(e) => {
            formik.handleBlur(e);
            setTimeout(() => setIsFocused(false), 150);
          }}
          onChange={handleChange}
          onFocus={() => {
            setIsFocused(true);
          }}
          inputClassName="h-9"
          iconLeft={
            <Search
              onClick={() => searchFieldRef.current.focus()}
              className="h-5 w-5 text-gray-400"
            />
          }
          iconRight={
            !!formik.values.search ? (
              <span onClick={clearSearch}>
                <CloseCircle className="h-5 w-5 cursor-pointer text-gray-650" />
              </span>
            ) : null
          }
        />
      </form>
      <SearchDropdown
        isFocused={isFocused}
        hasEmptyResult={hasEmptyResult}
        openSearchResult={openSearchResult}
        searchTerm={formik.values.search}
        handleSubmit={formik.handleSubmit}
        userSearchHistories={userSearchHistories}
        searchRecommendations={searchRecommendations}
      />
    </div>
  );
};

export default SearchBar;
