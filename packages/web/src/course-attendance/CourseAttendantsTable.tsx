import { Column, Table } from 'react-virtualized';
import useTranslation from '../i18n/useTranslation';
import InputCheckbox from '../ui-kit/InputCheckbox';
import { CourseSessionBookingStatus } from '../models/course';
import { FaCheck, FaWindowClose } from 'react-icons/fa';

export const CourseAttendantsTable = (props) => {
  const { t } = useTranslation();
  const {
    items: itemsOrNull,
    height,
    width,
    checkedRows,
    onCheckboxChangeAction,
  } = props;

  const items = itemsOrNull || [];

  const noRowRenderer = () => {
    return (
      <div
        className="flex flex-row items-center justify-center"
        style={{ height: '400px' }}
      >
        <span className="font-bold">
          {itemsOrNull
            ? t('courseAttendanceListPage.noStudents')
            : t('courseAttendanceListPage.selectSessionToSeeList')}
        </span>
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
            checked={checkedRows.length === items.length && items.length > 0}
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
        width={200}
        dataKey="name"
        className="text-left"
        cellDataGetter={({ rowData }) => {
          return `${rowData?.firstName} ${rowData.lastName}`;
        }}
      />
      <Column
        headerRenderer={renderHeader}
        label="Email"
        dataKey="email"
        width={300}
        className="text-left"
      />
      <Column
        headerRenderer={renderHeader}
        label="Attendance status"
        dataKey="status"
        width={300}
        className="text-left"
        cellRenderer={({ rowData }) => {
          if (rowData.bookingStatus === CourseSessionBookingStatus.NO_MARK)
            return t('courseAttendanceListPage.noMark');

          return (
            <div className="flex items-center space-x-2">
              {rowData.bookingStatus === CourseSessionBookingStatus.ATTENDED ? (
                <>
                  <FaCheck
                    className="mr-2 h-5 w-5 text-green-300"
                    aria-hidden="true"
                  />
                  <span>{t('courseAttendanceListPage.attended')}</span>
                </>
              ) : (
                <>
                  <FaWindowClose
                    className="mr-2 h-5 w-5 text-red-300"
                    aria-hidden="true"
                  />
                  <span>{t('courseAttendanceListPage.notAttended')}</span>
                </>
              )}
            </div>
          );
        }}
      />
    </Table>
  );
};
