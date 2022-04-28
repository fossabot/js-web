import cx from 'classnames';
import { useRouter } from 'next/router';

import { stringifyUrl } from 'query-string';
import { FormEvent, useState } from 'react';

import usePagination from '../hooks/usePagination';

import { FiChevronsLeft } from 'react-icons/fi';
import { FiChevronLeft } from 'react-icons/fi';
import { FiChevronRight } from 'react-icons/fi';
import { FiChevronsRight } from 'react-icons/fi';

interface Pagination {
  totalPages: number;
  className?: string;
}

export const PaginationButton = (props) => (
  <button
    className={cx('mr-2 rounded-md border p-3 text-gray-600', props.className, {
      'hover:border-gray-500 hover:text-gray-650': !props.disabled,
      'cursor-not-allowed': props.disabled,
    })}
    onClick={props.onClick}
    disabled={props.disabled}
  >
    {props.children}
  </button>
);

const Pagination = (props: Pagination) => {
  const router = useRouter();
  const { page, pathname, perPage } = usePagination();
  const [currentInputPage, setInputPage] = useState(page);

  const canGoBack = page === 1;
  const canGoForward = page === props.totalPages;

  function goToPage(page: number, pageLimit: number = perPage) {
    router.push(
      stringifyUrl({
        url: pathname,
        query: {
          ...router.query,
          page,
          perPage: pageLimit,
        },
      }),
    );
  }

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    goToPage(currentInputPage);
  };

  return (
    <div className={cx('float-right m-2', props.className)}>
      <div className="inline-block">
        <PaginationButton onClick={() => goToPage(1)} disabled={canGoBack}>
          {<FiChevronsLeft />}
        </PaginationButton>
        <PaginationButton
          onClick={() => goToPage(page - 1)}
          disabled={canGoBack}
        >
          {<FiChevronLeft />}
        </PaginationButton>
        <PaginationButton
          onClick={() => goToPage(page + 1)}
          disabled={canGoForward}
        >
          {<FiChevronRight />}
        </PaginationButton>
        <PaginationButton
          onClick={() => goToPage(props.totalPages)}
          disabled={canGoForward}
        >
          {<FiChevronsRight />}
        </PaginationButton>
        <span>
          Page{' '}
          <strong>
            {page} of {props.totalPages}
          </strong>{' '}
        </span>
      </div>
      <div className="ml-2 inline-block">
        <form onSubmit={onSubmit}>
          <span>
            | Go to page:
            <input
              className="focus:outline-none focus:shadow-outline mx-2 appearance-none rounded border p-2 leading-tight text-gray-700 shadow-sm"
              type="number"
              style={{ width: '80px' }}
              value={currentInputPage}
              max={props.totalPages}
              min={1}
              onChange={(e) => {
                setInputPage(e.target.value ? Number(e.target.value) : 1);
              }}
            />
          </span>
        </form>
      </div>
      <div className="ml-2 inline-block">
        <span>
          Rows per page:
          <select
            className="ml-2 rounded-md border bg-white p-2 text-black"
            value={perPage}
            onChange={(e) => {
              goToPage(page, Number(e.target.value));
            }}
          >
            {[10, 20, 30, 40, 50, 100].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                Show {pageSize}
              </option>
            ))}
          </select>
        </span>
      </div>
    </div>
  );
};

export default Pagination;
