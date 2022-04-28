import 'react-virtualized/styles.css';
import { AutoSizer } from 'react-virtualized';
import React, { useEffect, useState } from 'react';

function VirtualizedTable({
  list,
  CustomTable,
  checkedRows,
  onCheckboxChangeAction,
}: {
  list: any[];
  CustomTable: any;
  checkedRows: string[];
  onCheckboxChangeAction: (args: any) => void;
}) {
  const [items, setItems] = useState(list);

  useEffect(() => {
    setItems(list);
  }, [list]);

  return (
    <AutoSizer>
      {({ height, width }) => (
        <CustomTable
          items={items}
          height={height}
          width={width}
          checkedRows={checkedRows}
          onCheckboxChangeAction={onCheckboxChangeAction}
        />
      )}
    </AutoSizer>
  );
}

export default VirtualizedTable;
