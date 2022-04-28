import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import {
  FiChevronLeft,
  FiChevronRight,
  FiChevronsLeft,
  FiChevronsRight,
} from 'react-icons/fi';
import { PaginationButton } from '../Pagination';
import { VirtualizedTableColumnProp } from './GenericVirtualizedTable';
import VirtualizedTableWithPagination from './VirtualizedTableWithPagniation';

export interface IThreePaneRightPane<T extends { id: string }> {
  list: T[];
  checkedRows: T['id'][];
  setCheckedRows: Dispatch<SetStateAction<T['id'][]>>;
  perPage?: number;
  emptyText: string;
  columns: VirtualizedTableColumnProp[];
}

const ThreePaneRightPane = <T extends { id: string }>({
  list,
  checkedRows,
  setCheckedRows,
  perPage = 7,
  columns,
  emptyText,
}: IThreePaneRightPane<T>) => {
  const [page, setPage] = useState(1);

  const total = Math.ceil(list.length / perPage);

  const canGoBack = page > 1;
  const canGoForward = page < total;

  const goToPage = (page: number) => {
    setPage(page);
  };

  useEffect(() => setPage(1), [list]);

  return (
    <div className="flex w-3/4 px-2 py-2">
      <div className="flex-1 flex-col rounded bg-white p-4 shadow-lg">
        <div className="h-472px">
          <VirtualizedTableWithPagination
            list={list}
            checkedRows={checkedRows}
            onCheckboxChangeAction={setCheckedRows}
            page={page}
            perPage={perPage}
            columns={columns}
            emptyText={emptyText}
          />
        </div>
        {total > 0 && (
          <div className="flex flex-row items-center justify-end">
            <PaginationButton onClick={() => goToPage(1)} disabled={!canGoBack}>
              {<FiChevronsLeft />}
            </PaginationButton>
            <PaginationButton
              onClick={() => goToPage(page - 1)}
              disabled={!canGoBack}
            >
              {<FiChevronLeft />}
            </PaginationButton>
            <PaginationButton
              onClick={() => goToPage(page + 1)}
              disabled={!canGoForward}
            >
              {<FiChevronRight />}
            </PaginationButton>
            <PaginationButton
              onClick={() => goToPage(total)}
              disabled={!canGoForward}
            >
              {<FiChevronsRight />}
            </PaginationButton>
            <span>
              Page{' '}
              <strong>
                {page} of {total}
              </strong>{' '}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ThreePaneRightPane;
