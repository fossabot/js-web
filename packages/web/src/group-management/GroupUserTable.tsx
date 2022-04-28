import { TiTick } from 'react-icons/ti';
import { VscError } from 'react-icons/vsc';
import { Table, Column } from 'react-virtualized';
import InputCheckbox from '../ui-kit/InputCheckbox';

const GroupUserTable = (props) => {
  const { items, height, width, checkedRows, onCheckboxChangeAction } = props;
  const noRowRenderer = () => {
    return (
      <div
        className="flex flex-row items-center justify-center"
        style={{ height: '400px' }}
      >
        <span className="font-bold">No users assigned for this group.</span>
      </div>
    );
  };

  const renderHeader = ({ label, dataKey }) => {
    return (
      <div className="text-left font-bold" key={dataKey}>
        {label}
      </div>
    );
  };

  const getRowClassName = ({ index }) => {
    if (index < 0) return 'bg-white';

    const basicRow = 'hover:bg-blue-100 shadow-lg ';
    return basicRow + (index % 2 === 0 ? 'bg-gray-100' : 'bg-white');
  };

  const onChangeHeaderCheckbox = (e) => {
    const values = e.target.checked ? items.map((row) => row.id) : [];

    onCheckboxChangeAction(values);
  };

  const onChangeRowCheckbox = (data) => {
    const newRow = items[data.index].id;
    const values = checkedRows.includes(newRow)
      ? (old) => old.filter((row) => row !== newRow)
      : (old) => [...old, newRow];

    onCheckboxChangeAction(values);
  };

  const renderBoolean = (booleanVal = false) => {
    if (booleanVal) {
      return <TiTick />;
    }

    return <VscError />;
  };

  return (
    <Table
      headerHeight={40}
      height={height}
      rowCount={items.length}
      rowHeight={60}
      width={width}
      rowClassName={getRowClassName}
      rowGetter={({ index }) => items[index]}
      noRowsRenderer={noRowRenderer}
    >
      <Column
        disableSort
        dataKey="checkbox"
        width={30}
        className="cursor-pointer"
        headerRenderer={() => (
          <InputCheckbox
            name="headerCheckbox"
            inputClassName="cursor-pointer"
            checked={checkedRows.length === items.length}
            onChange={(e) => onChangeHeaderCheckbox(e)}
          />
        )}
        cellRenderer={({ rowIndex }) => (
          <InputCheckbox
            name={`checkbox-${rowIndex}`}
            inputClassName="cursor-pointer"
            checked={checkedRows.includes(items[rowIndex].id) === true}
            onChange={() => onChangeRowCheckbox({ index: rowIndex })}
          />
        )}
      />
      <Column
        headerRenderer={renderHeader}
        label="Fullname"
        dataKey="user"
        width={200}
        className="text-left"
        cellRenderer={({ cellData }) => cellData?.fullName}
      />
      <Column
        headerRenderer={renderHeader}
        label="Email"
        dataKey="user"
        width={300}
        className="text-left"
        cellRenderer={({ cellData }) => cellData?.email}
      />
      <Column
        headerRenderer={renderHeader}
        label="Group"
        dataKey="group"
        width={150}
        className="text-left"
        cellRenderer={({ cellData }) => cellData?.name}
      />
      <Column
        headerRenderer={renderHeader}
        label="Active"
        dataKey="user"
        width={50}
        className="text-left"
        cellRenderer={({ cellData }) => renderBoolean(cellData?.isActivated)}
      />
    </Table>
  );
};

export default GroupUserTable;
