import cx from 'classnames';
import debounce from 'lodash/debounce';
import uniqBy from 'lodash/uniqBy';
import { Dispatch, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePopper } from 'react-popper';
import API_PATHS from '../constants/apiPaths';
import { centralHttp } from '../http';
import { Close, Company, Group, Person, Search } from '../ui-kit/icons';

export type SearchResults = {
  id: string;
  name: string;
  type: 'user' | 'group' | 'organization';
};

interface IUserGroupOrgMultiSelectProps {
  selectedOptions: SearchResults[];
  setSelectedOptions: Dispatch<SearchResults[]>;
  error?: string;
  onBlur?: () => void;
}

export const UserGroupOrgMultiSelect = ({
  selectedOptions,
  setSelectedOptions,
  error,
  onBlur,
}: IUserGroupOrgMultiSelectProps) => {
  const rootRef = useRef(document.getElementById('__next'));
  const [search, setSearch] = useState('');
  const [userOptions, setUserOptions] = useState<SearchResults[]>([]);
  const [groupOptions, setGroupOptions] = useState<SearchResults[]>([]);
  const [orgOptions, setOrgOptions] = useState<SearchResults[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [isFocus, setIsFocus] = useState(false);

  const [referenceElement, setReferenceElement] =
    useState<HTMLElement | null>(null);
  const [popperElement, setPopperElement] = useState<HTMLElement | null>(null);
  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    strategy: 'fixed',
    placement: 'bottom',
  });

  const debounceRef = useRef(0);

  const debouncedSearch = useMemo(() => {
    const onSearch = async (search: string) => {
      try {
        const responses = await Promise.all([
          centralHttp.get(API_PATHS.ADMIN_USERS, {
            params: {
              search,
              searchField: 'email',
              perPage: 5,
            },
          }),
          centralHttp.get(API_PATHS.GROUPS_SEARCH, {
            params: {
              search,
              searchField: 'name',
              perPage: 5,
            },
          }),
          centralHttp.get(API_PATHS.ORGANIZATIONS, {
            params: {
              search,
              searchField: 'name',
              perPage: 5,
            },
          }),
        ]);
        setUserOptions(
          responses[0].data.data.map((user) => ({
            id: user.id,
            name: user.email,
            type: 'user',
          })),
        );
        setGroupOptions(
          responses[1].data.data.map((group) => ({
            id: group.id,
            name: group.name,
            type: 'group',
          })),
        );
        setOrgOptions(
          responses[2].data.data.map((org) => ({
            id: org.id,
            name: org.name,
            type: 'organization',
          })),
        );
      } catch (err) {
        console.error(err);
      } finally {
        setIsFetching(false);
      }
    };
    return debounce(onSearch, 500);
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (search.trim().length > 0) {
      setIsFetching(true);
      debouncedSearch(search);
    }
  }, [debouncedSearch, search]);

  const renderSearchResults = (options: SearchResults[]) => {
    return options.map((option) => (
      <a
        role="button"
        key={option.id}
        className="p-4 pl-10 hover:bg-gray-200"
        onClick={() => {
          setSelectedOptions(
            uniqBy([...selectedOptions, option], (option) => option.id),
          );
          setSearch('');
          setTimeout(() => {
            inputRef.current?.focus();
          }, 100);
        }}
      >
        <span>{option.name}</span>
      </a>
    ));
  };

  return (
    <>
      <div
        ref={setReferenceElement}
        className={cx(
          '-mt-1 -ml-1 flex max-h-28 min-h-22 flex-wrap items-start overflow-x-auto rounded-lg border p-2',
          { 'border-red-200': !!error, 'border-gray-300': !error },
        )}
        onClick={() => inputRef.current?.focus()}
      >
        {selectedOptions.map((option) => {
          const Icon =
            option.type === 'user'
              ? Person
              : option.type === 'group'
              ? Group
              : Company;
          return (
            <a
              role="button"
              key={`${option.type}-${option.id}`}
              className="m-1 flex items-center space-x-1 rounded bg-gray-200 py-1 px-2 text-caption text-gray-500"
              onClick={() =>
                setSelectedOptions(
                  selectedOptions.filter((_option) => _option.id !== option.id),
                )
              }
            >
              <Icon />
              <span className="text-black">{option.name}</span>
              <Close className="h-3 w-3 text-gray-650" />
            </a>
          );
        })}
        <input
          className="outline-none m-1 min-w-64 flex-1 resize-none border-0"
          type="text"
          ref={inputRef}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (search === '' && e.key === 'Backspace') {
              setSelectedOptions(selectedOptions.slice(0, -1));
            }
          }}
          placeholder="Enter user email, Group, Organization"
          onFocus={() => {
            setIsFocus(true);
          }}
          onBlur={() => {
            onBlur();
            setTimeout(() => {
              setIsFocus(false);
            }, 100);
          }}
        />
      </div>
      {!isFetching &&
        !!search.trim() &&
        isFocus &&
        createPortal(
          <div
            ref={setPopperElement}
            style={{
              ...styles.popper,
              width: referenceElement?.clientWidth,
            }}
            {...attributes.popper}
            className={cx(
              'z-60 max-h-80 divide-y overflow-y-auto rounded-lg bg-white shadow-sm',
            )}
          >
            {(
              [
                {
                  options: userOptions,
                  icon: Person,
                  label: 'User',
                  type: 'user',
                },
                {
                  options: groupOptions,
                  icon: Group,
                  label: 'Group',
                  type: 'group',
                },
                {
                  options: orgOptions,
                  icon: Company,
                  label: 'Organization',
                  type: 'organization',
                },
              ] as const
            ).map((category) => {
              const Icon = category.icon;
              if (category.options.length === 0) return null;
              return (
                <div key={category.label} className="flex flex-col">
                  <div className="flex items-center space-x-3 p-4">
                    <Icon className="text-gray-500" />
                    <span className="font-semibold">{category.label}</span>
                  </div>
                  {renderSearchResults(category.options)}
                </div>
              );
            })}
            {userOptions.length === 0 &&
              groupOptions.length === 0 &&
              orgOptions.length === 0 && (
                <div className="flex items-center space-x-3 p-4 font-semibold text-gray-500">
                  <Search />
                  <span>Can't find any results</span>
                </div>
              )}
          </div>,
          rootRef.current,
        )}
      {error && <p className="pt-2 text-footnote text-red-200">{error}</p>}
    </>
  );
};
