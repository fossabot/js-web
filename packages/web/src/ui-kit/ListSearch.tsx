import React, { useEffect, useState } from 'react';
import InputSection from './InputSection';
import InputSelect from './InputSelect';
import { find } from 'lodash';
import useSearch from '../hooks/useSearch';
import useSort from '../hooks/useSort';

export interface SelectOption {
  label: string;
  value: string;
}

export interface IListSearch {
  defaultSearchField?: string;
  fieldOptions?: SelectOption[];
  sortOptions?: SelectOption[];
}

function ListSearch(props: IListSearch) {
  const { sortOptions, fieldOptions, defaultSearchField } = props;
  const [searchValue, setSearchValue] = useState('');
  const [sortValue, setSortValue] = useState(null);
  const [sortList, setSortList] = useState([]);
  const { search, searchField, setSearchQuery } = useSearch();
  const [fieldOptionValue, setFieldOptionValue] = useState<string>(
    searchField || defaultSearchField,
  );
  const { order, orderBy, setSortQuery } = useSort();

  function handleSearchSubmit(e) {
    e.preventDefault();
    setSearchQuery({ searchField: fieldOptionValue, search: searchValue });
  }

  function handleSearchChange(e) {
    setSearchValue(e.target.value);
  }

  function handleSortChange(e) {
    const { value } = e.target;
    setSortQuery(value);
  }

  function handleSearchFieldChange(
    e: React.ChangeEvent<{ value: string; name: string }>,
  ) {
    setFieldOptionValue(e.target.value);
  }

  useEffect(() => {
    if (!sortOptions || !sortOptions.length) return;

    const list = [];
    sortOptions.forEach((option) => {
      list.push({
        label: option.label + ' ASC',
        value: { orderBy: option.value, order: 'ASC' },
      });
      list.push({
        label: option.label + ' DESC',
        value: { orderBy: option.value, order: 'DESC' },
      });
    });
    setSortList(list);
    if (order && orderBy) {
      setSortValue({ order, orderBy });
    } else {
      setSortValue(list[0].value);
    }
  }, [sortOptions]);

  useEffect(() => {
    if (order && orderBy) {
      setSortValue({ order, orderBy });
    } else if (sortList.length) {
      setSortValue(sortList[0].value);
    }
  }, [order, orderBy]);

  useEffect(() => {
    setSearchValue(search);
  }, [search]);

  return (
    <div className="mb-4 flex flex-col items-center justify-between text-footnote lg:flex-row lg:text-body">
      {fieldOptions && (
        <form
          className="mb-4 flex w-full items-center justify-between lg:mb-0 lg:w-5/12"
          onSubmit={handleSearchSubmit}
        >
          <div className="flex w-full flex-row">
            <label htmlFor="search" className="mr-4 self-center">
              Search
            </label>
            <InputSection
              name="search"
              placeholder="Search keyword"
              value={searchValue}
              onBlur={handleSearchChange}
              onChange={handleSearchChange}
              inputFieldWrapperClassName="flex h-full"
            />
            <div className="mr-4" />
            {Array.isArray(fieldOptions) && fieldOptions.length > 0 && (
              <InputSelect
                name="searchField"
                value={find(fieldOptions, { value: fieldOptionValue })}
                options={fieldOptions}
                renderOptions={fieldOptions}
                onBlur={null}
                onChange={handleSearchFieldChange}
              />
            )}
            <input
              type="submit"
              style={{
                position: 'absolute',
                left: '-9999px',
                width: '1px',
                height: '1px',
              }}
              tabIndex={-1}
            />
          </div>
        </form>
      )}
      {sortList && sortList.length > 0 && setSortValue && (
        <div className="flex w-full items-center lg:w-3/12">
          <label htmlFor="search" className="mr-4 flex-shrink-0">
            Sort by
          </label>
          <InputSelect
            name="sort"
            value={{
              label: find(
                sortList,
                (s) =>
                  sortValue?.order === s.value.order &&
                  sortValue?.orderBy === s.value.orderBy,
              )?.label,
              value: sortValue?.value,
            }}
            options={sortList}
            renderOptions={sortList}
            onChange={handleSortChange}
            onBlur={null}
          />
        </div>
      )}
    </div>
  );
}

export default ListSearch;
