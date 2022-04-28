import cx from 'classnames';
import { useEffect, useState } from 'react';
import {
  Table,
  Column,
  SortIndicator,
  SortDirection,
  SortDirectionType,
  TableCellRenderer,
  TableHeaderProps,
} from 'react-virtualized';
import InputCheckbox from '../InputCheckbox';
import { orderBy as sort } from 'lodash';

const getRowClassName = ({ index }) => {
  if (index < 0) return 'bg-white';

  const basicRow = 'hover:bg-blue-100 shadow-lg';
  return basicRow + (index % 2 === 0 ? 'bg-gray-100' : 'bg-white');
};

export type VirtualizedTableColumnProp = {
  label?: string;
  dataKey: string;
  width: number;
  className?: string;
  cellRenderer?: TableCellRenderer;
  disableSort?: boolean;
};

export interface IGenericVirtualizedTable<T extends { id: string }> {
  items: T[];
  height: number;
  width: number;
  checkedRows: T['id'][];
  onCheckboxChangeAction: (val: string[]) => void;
  page: number;
  perPage: number;
  emptyText: string;
  columns: VirtualizedTableColumnProp[];
}

const GenericVirtualizedTable = <T extends { id: string }>({
  items,
  height,
  width,
  checkedRows,
  onCheckboxChangeAction,
  columns,
  page,
  perPage,
  emptyText,
}: IGenericVirtualizedTable<T>) => {
  const [sortedItems, setSortedItems] = useState(items);
  const [sortDirection, setSortDirection] = useState<SortDirectionType>(
    SortDirection.ASC,
  );
  const [sortBy, setSortBy] = useState(columns[0]?.dataKey || '');

  const noRowRenderer = () => (
    <div className="flex h-full flex-row items-center justify-center">
      <span className="font-bold">{emptyText}</span>
    </div>
  );

  const onHeaderClick = (dataKey) => {
    setSortBy(dataKey);
    sortDirection === SortDirection.ASC
      ? setSortDirection(SortDirection.DESC)
      : setSortDirection(SortDirection.ASC);
  };

  const renderHeader = ({ label, dataKey, disableSort }: TableHeaderProps) => (
    <div
      className={cx('flex w-min flex-row items-center text-left font-bold', {
        'cursor-pointer': !disableSort,
      })}
      key={dataKey}
      onClick={() => !disableSort && onHeaderClick(dataKey)}
    >
      {label}
      {sortBy === dataKey && (
        <SortIndicator
          sortDirection={
            sortDirection === SortDirection.ASC
              ? SortDirection.DESC
              : SortDirection.ASC
          }
        />
      )}
    </div>
  );

  const onChangeHeaderCheckbox = (e) => {
    const values = e.target.checked ? sortedItems.map((row) => row.id) : [];

    onCheckboxChangeAction(values);
  };

  const onChangeRowCheckbox = (data) => {
    const newRow = sortedItems[data.index].id;
    const values = checkedRows.includes(newRow)
      ? (old) => old.filter((row) => row !== newRow)
      : (old) => [...old, newRow];

    onCheckboxChangeAction(values as unknown as string[]);
  };

  useEffect(
    () =>
      setSortedItems(
        sort(
          items,
          [sortBy],
          [sortDirection.toLowerCase() as 'asc' | 'desc'],
        ).slice((page - 1) * perPage, page * perPage),
      ),
    [items, sortDirection, sortBy, page, perPage],
  );

  return (
    <Table
      headerHeight={40}
      height={height}
      rowCount={sortedItems.length}
      rowHeight={60}
      width={width}
      rowClassName={getRowClassName}
      rowGetter={({ index }) => sortedItems[index]}
      noRowsRenderer={noRowRenderer}
      gridStyle={{ overflowY: 'hidden' }}
    >
      <Column
        disableSort
        dataKey="checkbox"
        width={75}
        className="cursor-pointer"
        headerRenderer={() => (
          <InputCheckbox
            name="headerCheckbox"
            inputClassName="cursor-pointer flex-shrink-0"
            checked={checkedRows.length === sortedItems.length}
            onChange={(e) => onChangeHeaderCheckbox(e)}
          />
        )}
        cellRenderer={({ rowIndex }) => (
          <InputCheckbox
            name={`checkbox-${rowIndex}`}
            inputClassName="cursor-pointer flex-shrink-0"
            checked={checkedRows.includes(sortedItems[rowIndex].id)}
            onChange={() => onChangeRowCheckbox({ index: rowIndex })}
          />
        )}
      />
      {columns.map((column) => (
        <Column
          disableSort={column.disableSort}
          headerRenderer={renderHeader}
          label={column.label}
          dataKey={column.dataKey}
          width={column.width}
          className={cx('text-left', column.className)}
          key={column.dataKey}
          cellRenderer={column.cellRenderer}
        />
      ))}
    </Table>
  );
};

export default GenericVirtualizedTable;
