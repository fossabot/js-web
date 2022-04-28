import { FunctionComponent } from 'react';
import { format } from 'date-fns';
import { useRouter } from 'next/router';

import Button from '../../ui-kit/Button';
import Pagination from '../../ui-kit/Pagination';
import WEB_PATHS from '../../constants/webPaths';
import ListSearch from '../../ui-kit/ListSearch';
import InputCheckbox from '../../ui-kit/InputCheckbox';
import { TableColumn, TableHead } from '../../ui-kit/Table';
import { ILearningTrack } from '../../models/learningTrack';

interface IProps {
  learningTracks: ILearningTrack<string>[];
  totalPages?: number;
  onClickSelect: (arg: string) => void;
  isSelectAll: boolean;
  setSelectAll: (arg: boolean) => void;
  selectedLearningTracks: string[];
}

interface ILearningTrackItemProps {
  learningTrack: ILearningTrack<string>;
  checked: boolean;
  onClickSelect: (arg: string) => void;
}

const LearningTrackItem: FunctionComponent<ILearningTrackItemProps> = ({
  learningTrack,
  checked,
  onClickSelect,
}) => {
  const router = useRouter();
  const routeToDetail = (learningTrackId: string) => {
    router.push(
      WEB_PATHS.ADMIN_LEARNING_TRACK_DETAIL.replace(':id', learningTrackId),
    );
  };

  return (
    <tr
      className="hover:bg-gray-100"
      onClick={() => onClickSelect(learningTrack.id)}
    >
      <TableColumn>
        <InputCheckbox
          inputClassName="cursor-pointer"
          name={`checkbox-${learningTrack.id}`}
          checked={checked}
          readOnly={true}
        />
      </TableColumn>
      <TableColumn>{learningTrack.title}</TableColumn>
      <TableColumn>
        {learningTrack.topics.map((t) => t.name).join(', ')}
      </TableColumn>
      <TableColumn>
        {learningTrack.tags.map((t) => t.name).join(', ')}
      </TableColumn>
      <TableColumn>
        {format(new Date(learningTrack.createdAt), 'dd MMMM yyyy H:mm')}
      </TableColumn>
      <TableColumn>
        <Button
          variant="primary"
          size="small"
          type="button"
          className="flex-shrink-0 py-2"
          onClick={() => routeToDetail(learningTrack.id)}
        >
          Edit
        </Button>
      </TableColumn>
    </tr>
  );
};

const searchOptions = [
  { label: 'Learning Track Title', value: 'title' },
  { label: 'Tag Name', value: 'tag' },
  { label: 'Topic Name', value: 'topic' },
];

const sortOptions = [
  { label: 'Created Date', value: 'createdAt' },
  { label: 'Title', value: 'title' },
];

const LearningTrackList: FunctionComponent<IProps> = (props) => {
  return (
    <>
      <ListSearch
        defaultSearchField="title"
        fieldOptions={searchOptions}
        sortOptions={sortOptions}
      />
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
              <TableHead className="w-2/6">Title</TableHead>
              <TableHead className="w-1/6">Topic Name</TableHead>
              <TableHead className="w-1/6">Tag</TableHead>
              <TableHead className="w-1/6">Create At</TableHead>
              <TableHead className="w-1/6">Actions</TableHead>
            </tr>
          </thead>
          <tbody>
            {props.learningTracks && props.learningTracks.length > 0 ? (
              props.learningTracks.map((learningTrack) => (
                <LearningTrackItem
                  key={learningTrack.id}
                  learningTrack={learningTrack}
                  onClickSelect={props.onClickSelect}
                  checked={props.selectedLearningTracks.includes(
                    learningTrack.id,
                  )}
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

export default LearningTrackList;
