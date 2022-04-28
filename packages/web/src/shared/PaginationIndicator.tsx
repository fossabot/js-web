import cx from 'classnames';
import Link from 'next/link';
import { useMemo } from 'react';
import { stringifyUrl } from 'query-string';
import { NextRouter, useRouter } from 'next/router';

import InputSelect from '../ui-kit/InputSelect';
import ArrowLeft from '../ui-kit/icons/ArrowLeft';
import usePagination from '../hooks/usePagination';
import useTranslation from '../i18n/useTranslation';
import ArrowRight from '../ui-kit/icons/ArrowRight';
import { generatePagination } from '../utils/pagination';

interface IPageLinkProps {
  pageNumber: number;
  currentPage: number;
  router: NextRouter;
}

function PageLink({ pageNumber, currentPage, router }: IPageLinkProps) {
  const link = stringifyUrl({
    url: router.pathname,
    query: {
      ...router.query,
      page: pageNumber,
    },
  });

  return (
    <Link href={link}>
      <a
        className={cx(
          'mx-4 text-caption',
          currentPage === pageNumber
            ? 'font-semibold text-brand-primary'
            : 'text-gray-600',
        )}
      >
        {pageNumber}
      </a>
    </Link>
  );
}

function PlaceholderLink() {
  return <div className="mx-5 text-caption text-gray-600">...</div>;
}

const itemsPerPageArray = [10, 20, 50, 100, 200];

interface IPaginationIndicatorProps {
  totalPages: number;
  totalRecords: number;
  defaultPerPage: number;
  resultLength: number;
  showPageSizeDropDown?: boolean;
}

export default function PaginationIndicator({
  totalPages,
  totalRecords,
  resultLength,
  defaultPerPage = 12,
  showPageSizeDropDown = false,
}: IPaginationIndicatorProps) {
  const router = useRouter();
  const { page, pathname, perPage, setPerPage } = usePagination({
    defaultPerPage,
  });
  const { t } = useTranslation();

  const pageOptions = useMemo(() => generatePageOptions(), [totalPages]);
  const canGoPrevious = useMemo(() => page > 1, [page]);
  const canGoNext = useMemo(() => page < totalPages, [page, totalPages]);

  function generatePageOptions() {
    return Array.from({ length: totalPages }).map((_, index) => {
      const number = index + 1;
      return { label: number, value: number };
    });
  }

  function getPageUrl(page) {
    const newUrl = stringifyUrl({
      url: pathname,
      query: {
        ...router.query,
        page,
        perPage,
      },
    });
    return newUrl;
  }

  function changePage(page) {
    const url = getPageUrl(page);
    router.push(url);
  }

  function handlePageChanged(page) {
    changePage(page);
  }

  function goPrevious() {
    if (page > 1) changePage(page - 1);
  }

  function goNext() {
    if (page < totalPages) changePage(page + 1);
  }

  function handlePageSizeChanged(perPage) {
    setPerPage(perPage);
  }

  const numberedPager = useMemo(() => {
    const pagination = generatePagination(page, totalPages);
    return pagination.map((p, index) => {
      if (p === '...') {
        return <PlaceholderLink key={index} />;
      } else {
        return (
          <PageLink
            key={index}
            pageNumber={p}
            currentPage={page}
            router={router}
          />
        );
      }
    });
  }, [page, totalPages]);

  const pageSizeOptions = useMemo(
    () =>
      itemsPerPageArray.map((size) => ({
        label: `${t('pagination.show')} ${size}`,
        value: size,
      })),
    [itemsPerPageArray],
  );

  return (
    <div className="w-full lg:mt-2 lg:flex lg:items-center lg:justify-between">
      <div className="flex flex-shrink-0 items-center justify-between py-6 text-caption lg:mr-auto">
        {showPageSizeDropDown && (
          <div className="mr-4 w-32">
            <InputSelect
              name="pagesize"
              value={{
                label: `${t('pagination.show')} ${perPage || defaultPerPage}`,
                value: perPage || defaultPerPage,
              }}
              options={pageSizeOptions}
              renderOptions={pageSizeOptions}
              onChange={(e) => handlePageSizeChanged(e.target.value)}
              onBlur={null}
              isSearchable={true}
            />
          </div>
        )}
        <div className="text-gray-400">
          {t('catalogList.showing', { resultLength, totalRecords })}
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-gray-200 py-6 lg:border-t-0">
        <div className="w-1/3 lg:w-auto lg:pr-4">
          <div
            className={cx(
              'flex items-center',
              canGoPrevious ? 'cursor-pointer text-gray-600' : 'text-gray-400',
            )}
            onClick={goPrevious}
          >
            <div className="mr-4 w-6 lg:mr-5">
              <ArrowLeft />
            </div>{' '}
            {t('catalogList.previous')}
          </div>
        </div>
        <div className="hidden lg:flex lg:items-center lg:justify-between">
          {numberedPager}
        </div>
        <div className="w-1/3 lg:hidden ">
          <InputSelect
            name="page"
            value={{ label: page, value: page }}
            options={pageOptions}
            renderOptions={pageOptions}
            onChange={(e) => handlePageChanged(e.target.value)}
            onBlur={null}
            isSearchable={true}
          />
        </div>
        <div className="w-1/3 lg:w-auto lg:pl-4">
          <div
            className={cx(
              'flex items-center justify-end',
              canGoNext ? 'cursor-pointer text-gray-600' : 'text-gray-400',
            )}
            onClick={goNext}
          >
            {t('catalogList.next')}{' '}
            <div className="ml-4 w-6">
              <ArrowRight />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
