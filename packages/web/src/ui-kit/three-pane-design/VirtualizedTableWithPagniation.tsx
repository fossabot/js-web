import 'react-virtualized/styles.css';
import { AutoSizer } from 'react-virtualized';
import GenericVirtualizedTable, {
  VirtualizedTableColumnProp,
} from './GenericVirtualizedTable';

interface IVirtualizedTableWithPagination<T extends { id: string }> {
  list: T[];
  checkedRows: T['id'][];
  onCheckboxChangeAction: (args: any) => void;
  page: number;
  perPage: number;
  emptyText: string;
  columns: VirtualizedTableColumnProp[];
}

function VirtualizedTable<T extends { id: string }>({
  list,
  checkedRows,
  onCheckboxChangeAction,
  columns,
  page,
  perPage,
  emptyText,
}: IVirtualizedTableWithPagination<T>) {
  return (
    <AutoSizer>
      {({ height, width }) => (
        <GenericVirtualizedTable<T>
          items={list}
          height={height}
          width={width}
          checkedRows={checkedRows}
          onCheckboxChangeAction={onCheckboxChangeAction}
          columns={columns}
          page={page}
          perPage={perPage}
          emptyText={emptyText}
        />
      )}
    </AutoSizer>
  );
}

export default VirtualizedTable;
