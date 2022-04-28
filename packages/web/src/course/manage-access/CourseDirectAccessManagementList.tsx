import Link from 'next/link';
import find from 'lodash/find';
import { format } from 'date-fns';
import { FunctionComponent } from 'react';

import Button from '../../ui-kit/Button';
import useAccessorType from './useAccessorType';
import Pagination from '../../ui-kit/Pagination';
import WEB_PATHS from '../../constants/webPaths';
import ListSearch from '../../ui-kit/ListSearch';
import InputSelect from '../../ui-kit/InputSelect';
import InputCheckbox from '../../ui-kit/InputCheckbox';
import { TableColumn, TableHead } from '../../ui-kit/Table';
import { ICourseDirectAccess } from '../../models/courseDirectAccess';
interface IProps {
  courseDirectAccessList: ICourseDirectAccess<string>[];
  totalPages?: number;
  onClickSelect: (string) => void;
  isSelectAll: boolean;
  setSelectAll: (boolean) => void;
  selectedItems: string[];
  onEditAction: (item: ICourseDirectAccess) => void;
}

interface ICourseDirectAccessItemProps {
  courseDirectAccess: ICourseDirectAccess<string>;
  checked: boolean;
  onClickSelect: (string) => void;
  onEditAction: (item: ICourseDirectAccess) => void;
}

const CourseItem: FunctionComponent<ICourseDirectAccessItemProps> = ({
  courseDirectAccess,
  checked,
  onClickSelect,
  onEditAction,
}) => {
  return (
    <tr
      className="hover:bg-gray-100"
      onClick={() => onClickSelect(courseDirectAccess.id)}
    >
      <TableColumn>
        <InputCheckbox
          inputClassName="cursor-pointer"
          name={`checkbox-${courseDirectAccess.id}`}
          checked={checked}
          readOnly={true}
        />
      </TableColumn>
      <TableColumn>
        <Link
          href={WEB_PATHS.ADMIN_COURSE_DETAIL.replace(
            ':id',
            courseDirectAccess.course.id,
          )}
        >
          <a className="underline">{courseDirectAccess.course.title}</a>
        </Link>
      </TableColumn>
      <TableColumn>{courseDirectAccess.accessor.displayName}</TableColumn>
      <TableColumn>{courseDirectAccess.accessorType}</TableColumn>
      <TableColumn>
        {format(
          new Date(courseDirectAccess.expiryDateTime),
          'dd MMMM yyyy H:mm',
        )}
      </TableColumn>
      <TableColumn>
        {format(new Date(courseDirectAccess.createdAt), 'dd MMMM yyyy H:mm')}
      </TableColumn>
      <TableColumn>
        <Button
          variant="primary"
          size="small"
          type="button"
          className="flex-shrink-0 py-2"
          onClick={() => onEditAction(courseDirectAccess)}
        >
          Edit
        </Button>
      </TableColumn>
    </tr>
  );
};

const searchOptions = [
  { label: 'Name', value: 'accessorName' },
  { label: 'Course Title', value: 'courseTitle' },
  { label: 'User email', value: 'userEmail' },
];
const sortOptions = [
  { label: 'Created Date', value: 'createdAt' },
  { label: 'Expiry Date', value: 'expiryDateTime' },
];

const CourseDirectAccessManagementList: FunctionComponent<IProps> = (props) => {
  const { accessorType, accessorTypeOptions, handleAccessorTypeChange } =
    useAccessorType();

  return (
    <>
      <ListSearch
        defaultSearchField="accessorName"
        fieldOptions={searchOptions}
        sortOptions={sortOptions}
      />
      <div className="flex w-full flex-row items-center justify-end">
        <label htmlFor="search" className="mr-4 flex-shrink-0">
          Accessor type
        </label>
        <InputSelect
          name="accessorType"
          value={find(accessorTypeOptions, { value: accessorType })}
          options={accessorTypeOptions}
          renderOptions={accessorTypeOptions}
          onBlur={null}
          selectClassWrapperName="w-full lg:w-1/6"
          onChange={(e) => handleAccessorTypeChange(e.target.value)}
        />
      </div>
      <div className="my-4 overflow-x-scroll rounded bg-white shadow-md">
        <table className="w-full table-auto border-collapse border text-left">
          <thead>
            <tr>
              <TableHead className="w-min">
                <InputCheckbox
                  name="checkbox-header"
                  checked={props.isSelectAll}
                  onChange={() => {
                    props.setSelectAll(!props.isSelectAll);
                  }}
                />
              </TableHead>
              <TableHead className="w-1/6">Course title</TableHead>
              <TableHead className="w-1/6">Accessor name</TableHead>
              <TableHead className="w-1/6">Accessor type</TableHead>
              <TableHead className="w-1/6">Expiry date</TableHead>
              <TableHead className="w-1/6">Created At</TableHead>
              <TableHead className="w-1/6">Actions</TableHead>
            </tr>
          </thead>
          <tbody>
            {props.courseDirectAccessList &&
            props.courseDirectAccessList.length > 0 ? (
              props.courseDirectAccessList.map((courseDirectAccess) => (
                <CourseItem
                  key={courseDirectAccess.id}
                  onEditAction={props.onEditAction}
                  courseDirectAccess={courseDirectAccess}
                  onClickSelect={props.onClickSelect}
                  checked={props.selectedItems.includes(courseDirectAccess.id)}
                />
              ))
            ) : (
              <tr className="text-center hover:bg-gray-100">
                <TableColumn colSpan={9}>No records found!</TableColumn>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {props.totalPages > 0 && <Pagination totalPages={props.totalPages} />}
    </>
  );
};

export default CourseDirectAccessManagementList;
