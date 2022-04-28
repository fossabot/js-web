import { AxiosInstance } from 'axios';
import cx from 'classnames';
import debounce from 'lodash/debounce';
import { useEffect, useMemo, useState } from 'react';
import { centralHttp } from '../http';
import { BaseResponseDto } from '../models/BaseResponse.dto';
import { CloseCircle, Search } from './icons';
import InputField from './InputField';

interface SearchQuery {
  search: string;
}

export interface IAdminSearchInputProps {
  onChangeFilter: (getQuery: (query: SearchQuery) => SearchQuery) => void;
  value: string;
  apiPath?: string;
  api?: AxiosInstance;
  placeholder?: string;
  getSearchResults?: (term: string) => Promise<string[]>;
}

export const AdminSearchInput = ({
  value,
  onChangeFilter,
  apiPath,
  api = centralHttp,
  placeholder,
  getSearchResults,
}: IAdminSearchInputProps) => {
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [search, setSearch] = useState(value);

  const [isFetching, setIsFetching] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);

  useEffect(() => {
    setSearch(value || '');
  }, [value]);

  const debounceSuggest = useMemo(() => {
    const suggest = async (term: string) => {
      const results = getSearchResults
        ? await getSearchResults(term)
        : (
            await api.get<BaseResponseDto<string[]>>(apiPath, {
              params: { search: term },
            })
          ).data.data;

      setSearchSuggestions(results);
      setIsFetching(false);
    };
    return debounce(suggest, 200);
  }, [api, apiPath, getSearchResults]);

  useEffect(() => {
    const trimmedSearch = search.trim();
    if (trimmedSearch.length > 0) {
      setIsFetching(true);
      debounceSuggest(trimmedSearch);
    } else {
      setSearchSuggestions([]);
      setIsFetching(false);
    }
  }, [search, debounceSuggest]);

  return (
    <form
      className="relative"
      onSubmit={(e) => {
        e.preventDefault();
        onChangeFilter((query) => ({ ...query, search }));
      }}
    >
      <InputField
        name="search"
        placeholder={placeholder}
        value={search}
        onChange={(event) => {
          setSearch(event.target.value);
        }}
        iconLeft={<Search className="h-5 w-5 text-gray-400" />}
        iconRight={
          <a
            role="button"
            className={cx({ hidden: search.length === 0 })}
            onClick={() => {
              setSearch('');
              onChangeFilter((query) => ({ ...query, search: '' }));
            }}
          >
            <CloseCircle className="h-5 w-5 cursor-pointer text-gray-650" />
          </a>
        }
        onFocus={() => setIsInputFocused(true)}
        onBlur={() => {
          setTimeout(() => {
            setIsInputFocused(false);
          }, 150);
        }}
      />
      {isInputFocused &&
        search.length > 0 &&
        (searchSuggestions.length > 0 ||
          (searchSuggestions.length === 0 && !isFetching)) && (
          <div
            className="absolute top-12 right-0 z-50 space-y-2 rounded-lg bg-white p-4 shadow"
            style={{ minWidth: '25rem' }}
          >
            {searchSuggestions.map((suggestion, index) => (
              <a
                role="button"
                key={`${suggestion}-${index}`}
                className="flex items-center space-x-2 rounded-lg bg-white p-2 text-black hover:bg-gray-200"
                onClick={() => {
                  onChangeFilter((query) => ({ ...query, search: suggestion }));
                }}
              >
                <Search className="h-4 w-4 text-gray-400" />
                <span>{suggestion}</span>
              </a>
            ))}
            {searchSuggestions.length === 0 && !isFetching && (
              <span>No results for "{search}"</span>
            )}
          </div>
        )}
    </form>
  );
};
