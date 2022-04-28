import { FC } from 'react';
import Link from 'next/link';
import { TableColumn, TableHead } from '../../ui-kit/Table';
import ListSearch from '../../ui-kit/ListSearch';
import Pagination from '../../ui-kit/Pagination';
import InputCheckbox from '../../ui-kit/InputCheckbox';
import Button from '../../ui-kit/Button';
import WEB_PATHS from '../../constants/webPaths';
import { TiTick } from 'react-icons/ti';
import { VscError } from 'react-icons/vsc';

interface ILearningWayList {
  totalPages: number;
  learningWays: any[];
  onDeleteAction: (number) => void;
  setSelectAll: (boolean) => void;
  isSelectAll: boolean;
  selectedLearningWays: string[];
  onClickSelect: (string) => void;
  onClickEdit: (any) => void;
}

const sortOptions = [
  { label: 'Created Date', value: 'createdAt' },
  { label: 'Name', value: 'name' },
];

const renderBoolean = (booleanVal = false) => {
  if (booleanVal) {
    return <TiTick />;
  }

  return <VscError />;
};

const LearningWayList: FC<ILearningWayList> = (props) => {
  return (
    <>
      <ListSearch
        defaultSearchField="name"
        fieldOptions={[{ label: 'Name', value: 'name' }]}
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
              <TableHead>Name</TableHead>
              <TableHead className="w-2/6">Parent</TableHead>
              <TableHead className="w-1/6">Is Default?</TableHead>
              <TableHead className="w-1/6">Edit</TableHead>
            </tr>
          </thead>
          <tbody className="w-full">
            {props.learningWays && props.learningWays.length > 0 ? (
              props.learningWays.map((learningWay, index) => {
                return (
                  <tr
                    className="hover:bg-gray-100"
                    key={index}
                    onClick={() => props.onClickSelect(learningWay)}
                  >
                    <TableColumn>
                      <InputCheckbox
                        inputClassName="cursor-pointer"
                        name={`checkbox-${learningWay.id}`}
                        checked={props.selectedLearningWays.includes(
                          learningWay,
                        )}
                        readOnly={true}
                      />
                    </TableColumn>
                    <TableColumn>
                      <Link
                        href={`${
                          WEB_PATHS.COURSE
                        }?searchField=learningWay&search=${encodeURIComponent(
                          learningWay.name,
                        )}`}
                      >
                        <a className="underline">{learningWay.name}</a>
                      </Link>
                    </TableColumn>
                    <TableColumn>
                      {learningWay.parent ? learningWay.parent.name : '-'}
                    </TableColumn>
                    <TableColumn>
                      {renderBoolean(!!learningWay.key)}
                    </TableColumn>
                    <TableColumn>
                      <Button
                        type="button"
                        variant="primary"
                        size="medium"
                        onClick={(e) => {
                          e.stopPropagation();
                          props.onClickEdit(learningWay);
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

export default LearningWayList;
