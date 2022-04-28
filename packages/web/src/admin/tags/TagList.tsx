import { FC } from 'react';
import Link from 'next/link';
import { TiTick } from 'react-icons/ti';
import { VscError } from 'react-icons/vsc';
import { TableColumn, TableHead } from '../../ui-kit/Table';
import ListSearch from '../../ui-kit/ListSearch';
import Pagination from '../../ui-kit/Pagination';
import InputCheckbox from '../../ui-kit/InputCheckbox';
import Button from '../../ui-kit/Button';
import WEB_PATHS from '../../constants/webPaths';

interface ITagList {
  totalPages: number;
  tags: any[];
  onDeleteAction: (number) => void;
  setSelectAll: (boolean) => void;
  isSelectAll: boolean;
  selectedTags: string[];
  onClickSelect: (string) => void;
  onClickEdit: (any) => void;
}

const sortOptions = [
  { label: 'Created Date', value: 'createdAt' },
  { label: 'Name', value: 'name' },
];

const TagList: FC<ITagList> = (props) => {
  const renderBoolean = (booleanVal = false) => {
    if (booleanVal) {
      return <TiTick />;
    }

    return <VscError />;
  };

  return (
    <>
      <ListSearch
        defaultSearchField="name"
        fieldOptions={[{ label: 'Tag name', value: 'name' }]}
        sortOptions={sortOptions}
      />
      <div className="my-4 overflow-x-scroll rounded bg-white shadow-md">
        <table className="w-full table-auto border-collapse border text-left">
          <thead>
            <tr>
              <TableHead className="w-6">
                <InputCheckbox
                  name="checkbox-header"
                  checked={props.isSelectAll}
                  onChange={() => {
                    props.setSelectAll(!props.isSelectAll);
                  }}
                />
              </TableHead>
              <TableHead>Tag name</TableHead>
              <TableHead className="w-1/4">Tag Type</TableHead>
              <TableHead className="w-1/6">Active status</TableHead>
              <TableHead className="w-1/6">Edit</TableHead>
            </tr>
          </thead>
          <tbody className="w-full">
            {props.tags && props.tags.length > 0 ? (
              props.tags.map((tag, index) => {
                return (
                  <tr
                    className="hover:bg-gray-100"
                    key={index}
                    onClick={() => props.onClickSelect(tag)}
                  >
                    <TableColumn>
                      <InputCheckbox
                        inputClassName="cursor-pointer"
                        name={`checkbox-${tag.id}`}
                        checked={props.selectedTags.includes(tag)}
                        readOnly={true}
                      />
                    </TableColumn>
                    <TableColumn>
                      <Link
                        href={`${
                          WEB_PATHS.COURSE
                        }?searchField=tag&search=${encodeURIComponent(
                          tag.name,
                        )}`}
                      >
                        <a className="underline">{tag.name}</a>
                      </Link>
                    </TableColumn>
                    <TableColumn>{tag.type}</TableColumn>
                    <TableColumn>{renderBoolean(tag.isActive)}</TableColumn>
                    <TableColumn>
                      <Button
                        type="button"
                        variant="primary"
                        size="medium"
                        onClick={(e) => {
                          e.stopPropagation();
                          props.onClickEdit(tag);
                        }}
                      >
                        Edit
                      </Button>
                    </TableColumn>
                  </tr>
                );
              })
            ) : (
              <tr className="text-center hover:bg-gray-100">
                <TableColumn colSpan={4}>No records found!</TableColumn>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {props.totalPages > 0 && <Pagination totalPages={props.totalPages} />}
    </>
  );
};

export default TagList;
