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
import { ILearningTrackDirectAccess } from '../../models/learningTrackDirectAccess';

interface IProps {
  learningTrackDirectAccessList: ILearningTrackDirectAccess<string>[];
  totalPages?: number;
  onClickSelect: (string) => void;
  isSelectAll: boolean;
  setSelectAll: (boolean) => void;
  selectedItems: string[];
  onEditAction: (item: ILearningTrackDirectAccess) => void;
}

interface ILearningTrackDirectAccessItemProps {
  learningTrackDirectAccess: ILearningTrackDirectAccess<string>;
  checked: boolean;
  onClickSelect: (string) => void;
  onEditAction: (item: ILearningTrackDirectAccess) => void;
}

const LearningTrackItem: FunctionComponent<ILearningTrackDirectAccessItemProps> =
  ({ learningTrackDirectAccess, checked, onClickSelect, onEditAction }) => {
    return (
      <tr
        className="hover:bg-gray-100"
        onClick={() => onClickSelect(learningTrackDirectAccess.id)}
      >
        <TableColumn>
          <InputCheckbox
            inputClassName="cursor-pointer"
            name={`checkbox-${learningTrackDirectAccess.id}`}
            checked={checked}
            readOnly={true}
          />
        </TableColumn>
        <TableColumn>
          <Link
            href={WEB_PATHS.ADMIN_COURSE_DETAIL.replace(
              ':id',
              learningTrackDirectAccess.learningTrack.id,
            )}
          >
            <a className="underline">
              {learningTrackDirectAccess.learningTrack.title}
            </a>
          </Link>
        </TableColumn>
        <TableColumn>
          {learningTrackDirectAccess.accessor.displayName}
        </TableColumn>
        <TableColumn>{learningTrackDirectAccess.accessorType}</TableColumn>
        <TableColumn>
          {format(
            new Date(learningTrackDirectAccess.expiryDateTime),
            'dd MMMM yyyy H:mm',
          )}
        </TableColumn>
        <TableColumn>
          {format(
            new Date(learningTrackDirectAccess.createdAt),
            'dd MMMM yyyy H:mm',
          )}
        </TableColumn>
        <TableColumn>
          <Button
            variant="primary"
            size="small"
            type="button"
            className="flex-shrink-0 py-2"
            onClick={() => onEditAction(learningTrackDirectAccess)}
          >
            Edit
          </Button>
        </TableColumn>
      </tr>
    );
  };

const searchOptions = [
  { label: 'Name', value: 'accessorName' },
  { label: 'Learning Track Title', value: 'learningTrackTitle' },
  { label: 'User email', value: 'userEmail' },
];
const sortOptions = [
  { label: 'Created Date', value: 'createdAt' },
  { label: 'Expiry Date', value: 'expiryDateTime' },
];

const LearningTrackDirectAccessManagementList: FunctionComponent<IProps> = (
  props,
) => {
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
              <TableHead className="w-1/6">Learning Track title</TableHead>
              <TableHead className="w-1/6">Accessor name</TableHead>
              <TableHead className="w-1/6">Accessor type</TableHead>
              <TableHead className="w-1/6">Expiry date</TableHead>
              <TableHead className="w-1/6">Created At</TableHead>
              <TableHead className="w-1/6">Actions</TableHead>
            </tr>
          </thead>
          <tbody>
            {props.learningTrackDirectAccessList &&
            props.learningTrackDirectAccessList.length > 0 ? (
              props.learningTrackDirectAccessList.map(
                (learningTrackDirectAccess) => (
                  <LearningTrackItem
                    key={learningTrackDirectAccess.id}
                    onEditAction={props.onEditAction}
                    learningTrackDirectAccess={learningTrackDirectAccess}
                    onClickSelect={props.onClickSelect}
                    checked={props.selectedItems.includes(
                      learningTrackDirectAccess.id,
                    )}
                  />
                ),
              )
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

export default LearningTrackDirectAccessManagementList;
