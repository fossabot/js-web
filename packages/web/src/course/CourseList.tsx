import { FunctionComponent } from 'react';
import { format } from 'date-fns';
import { useRouter } from 'next/router';

import Button from '../ui-kit/Button';
import { ICourse } from '../models/course';
import Pagination from '../ui-kit/Pagination';
import WEB_PATHS from '../constants/webPaths';
import ListSearch from '../ui-kit/ListSearch';
import InputCheckbox from '../ui-kit/InputCheckbox';
import { TableColumn, TableHead } from '../ui-kit/Table';
interface IProps {
  courses: ICourse<string>[];
  totalPages?: number;
  onClickSelect: (string) => void;
  isSelectAll: boolean;
  setSelectAll: (boolean) => void;
  selectedCourses: string[];
}

interface ICourseItemProps {
  course: ICourse<string>;
  checked: boolean;
  onClickSelect: (string) => void;
}

const CourseItem: FunctionComponent<ICourseItemProps> = ({
  course,
  checked,
  onClickSelect,
}) => {
  const router = useRouter();
  const routeToDetail = (courseId) => {
    router.push(WEB_PATHS.ADMIN_COURSE_DETAIL.replace(':id', courseId));
  };

  return (
    <tr className="hover:bg-gray-100" onClick={() => onClickSelect(course.id)}>
      <TableColumn>
        <InputCheckbox
          inputClassName="cursor-pointer"
          name={`checkbox-${course.id}`}
          checked={checked}
          readOnly={true}
        />
      </TableColumn>
      <TableColumn>{course.title}</TableColumn>
      <TableColumn>{course.topics.map((t) => t.name).join(', ')}</TableColumn>
      <TableColumn>{course.tags.map((t) => t.name).join(', ')}</TableColumn>
      <TableColumn>{course.category?.name}</TableColumn>
      <TableColumn>{course.status}</TableColumn>
      <TableColumn>
        {format(new Date(course.createdAt), 'dd MMMM yyyy H:mm')}
      </TableColumn>
      <TableColumn>
        <Button
          variant="primary"
          size="small"
          type="button"
          className="flex-shrink-0 py-2"
          onClick={() => routeToDetail(course.id)}
        >
          Edit
        </Button>
      </TableColumn>
    </tr>
  );
};

const searchOptions = [
  { label: 'Course Title', value: 'title' },
  { label: 'Category', value: 'category' },
  { label: 'Tag Name', value: 'tag' },
  { label: 'Topic Name', value: 'topic' },
  { label: 'Way of Learning Name', value: 'learningWay' },
];

const sortOptions = [
  { label: 'Created Date', value: 'createdAt' },
  { label: 'Title', value: 'title' },
];

const CourseList: FunctionComponent<IProps> = (props) => {
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
              <TableHead className="w-1/6">Title</TableHead>
              <TableHead className="w-1/6">Topic Name</TableHead>
              <TableHead className="w-1/6">Tag</TableHead>
              <TableHead className="w-1/6">Course Category</TableHead>
              <TableHead className="w-1/6">Status</TableHead>
              <TableHead className="w-1/6">Create At</TableHead>
              <TableHead className="w-1/6">Actions</TableHead>
            </tr>
          </thead>
          <tbody>
            {props.courses && props.courses.length > 0 ? (
              props.courses.map((course) => (
                <CourseItem
                  key={course.id}
                  course={course}
                  onClickSelect={props.onClickSelect}
                  checked={props.selectedCourses.includes(course.id)}
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

export default CourseList;
