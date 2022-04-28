import { FunctionComponent } from 'react';
import { format } from 'date-fns';
import { useRouter } from 'next/router';

import Button from '../ui-kit/Button';
import Pagination from '../ui-kit/Pagination';
import WEB_PATHS from '../constants/webPaths';
import ListSearch from '../ui-kit/ListSearch';
import InputCheckbox from '../ui-kit/InputCheckbox';
import { ICourseRule } from '../models/course-rule';
import { TableColumn, TableHead } from '../ui-kit/Table';

interface IProps {
  courseRules: ICourseRule[];
  totalPages?: number;
  onClickSelect: (string) => void;
  isSelectAll: boolean;
  setSelectAll: (boolean) => void;
  selectedCourseRules: string[];
}

interface ICourseRuleItemProps {
  courseRule: ICourseRule;
  checked: boolean;
  onClickSelect: (string) => void;
}

const CourseRule: FunctionComponent<ICourseRuleItemProps> = ({
  courseRule,
  checked,
  onClickSelect,
}) => {
  const router = useRouter();
  const routeToDetail = (courseRuleId: string) => {
    router.push(WEB_PATHS.COURSE_RULE_DETAIL.replace(':id', courseRuleId));
  };

  return (
    <tr
      className="hover:bg-gray-100"
      onClick={() => onClickSelect(courseRule.id)}
    >
      <TableColumn>
        <InputCheckbox
          inputClassName="cursor-pointer"
          name={`checkbox-${courseRule.id}`}
          checked={checked}
          readOnly={true}
        />
      </TableColumn>
      <TableColumn>{courseRule.name}</TableColumn>
      <TableColumn>
        {format(new Date(courseRule.createdAt), 'dd MMMM yyyy H:mm')}
      </TableColumn>
      <TableColumn>
        {courseRule.createdBy.firstName
          ? `${courseRule.createdBy.firstName} ${courseRule.createdBy.lastName}`
          : courseRule.createdBy.email}
      </TableColumn>
      <TableColumn>
        {courseRule.lastModifiedBy.firstName
          ? `${courseRule.lastModifiedBy.firstName} ${courseRule.lastModifiedBy.lastName}`
          : courseRule.lastModifiedBy.email}
      </TableColumn>

      <TableColumn>
        <Button
          variant="primary"
          size="small"
          type="button"
          disabled={!courseRule.isActive}
          className="flex-shrink-0 py-2"
          onClick={() => routeToDetail(courseRule.id)}
        >
          Edit
        </Button>
      </TableColumn>
    </tr>
  );
};

const CourseRuleList: FunctionComponent<IProps> = (props) => {
  const sortOptions = [
    { label: 'Created Date', value: 'createdAt' },
    { label: 'Name', value: 'name' },
  ];
  const searchOptions = [{ label: 'Rule Name', value: 'name' }];
  return (
    <>
      <ListSearch
        defaultSearchField="name"
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
              <TableHead className="w-1/5">Rule Name</TableHead>
              <TableHead className="w-1/5">Created On</TableHead>
              <TableHead className="w-1/5">Created By</TableHead>
              <TableHead className="w-1/5">Last Modified By</TableHead>
              <TableHead className="w-1/5">Actions</TableHead>
            </tr>
          </thead>
          <tbody>
            {props.courseRules && props.courseRules.length > 0 ? (
              props.courseRules.map((courseRule) => (
                <CourseRule
                  key={courseRule.id}
                  courseRule={courseRule}
                  onClickSelect={props.onClickSelect}
                  checked={props.selectedCourseRules.includes(courseRule.id)}
                />
              ))
            ) : (
              <tr className="text-center hover:bg-gray-100">
                <TableColumn colSpan={5}>No records found!</TableColumn>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {props.totalPages > 0 && <Pagination totalPages={props.totalPages} />}
    </>
  );
};

export default CourseRuleList;
