import { FC } from 'react';
import Link from 'next/link';
import { TableColumn, TableHead } from '../../ui-kit/Table';
import ListSearch from '../../ui-kit/ListSearch';
import Pagination from '../../ui-kit/Pagination';
import InputCheckbox from '../../ui-kit/InputCheckbox';
import Button from '../../ui-kit/Button';
import WEB_PATHS from '../../constants/webPaths';

interface ITopicList {
  totalPages: number;
  topics: any[];
  onDeleteAction: (number) => void;
  setSelectAll: (boolean) => void;
  isSelectAll: boolean;
  selectedTopics: string[];
  onClickSelect: (string) => void;
  onClickEdit: (any) => void;
}

const sortOptions = [
  { label: 'Created Date', value: 'createdAt' },
  { label: 'Name', value: 'name' },
];

const TopicList: FC<ITopicList> = (props) => {
  return (
    <>
      <ListSearch
        defaultSearchField="name"
        fieldOptions={[{ label: 'Topic name', value: 'name' }]}
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
              <TableHead>Topic name</TableHead>
              <TableHead className="w-2/6">Parent topic</TableHead>
              <TableHead className="w-1/6">Edit</TableHead>
            </tr>
          </thead>
          <tbody className="w-full">
            {props.topics && props.topics.length > 0 ? (
              props.topics.map((topic, index) => {
                return (
                  <tr
                    className="hover:bg-gray-100"
                    key={index}
                    onClick={() => props.onClickSelect(topic)}
                  >
                    <TableColumn>
                      <InputCheckbox
                        inputClassName="cursor-pointer"
                        name={`checkbox-${topic.id}`}
                        checked={props.selectedTopics.includes(topic)}
                        readOnly={true}
                      />
                    </TableColumn>
                    <TableColumn>
                      <Link
                        href={`${
                          WEB_PATHS.COURSE
                        }?searchField=topic&search=${encodeURIComponent(
                          topic.name,
                        )}`}
                      >
                        <a className="underline">{topic.name}</a>
                      </Link>
                    </TableColumn>
                    <TableColumn>
                      {topic.parent ? topic.parent.name : '-'}
                    </TableColumn>
                    <TableColumn>
                      <Button
                        type="button"
                        variant="primary"
                        size="medium"
                        onClick={(e) => {
                          e.stopPropagation();
                          props.onClickEdit(topic);
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

export default TopicList;
