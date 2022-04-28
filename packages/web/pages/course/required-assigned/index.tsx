import withAuth from '../../../src/app-state/auth';
import { CourseRequiredAssignedListPage } from '../../../src/course/required-assigned/CourseRequiredAssignedListPage';

export default withAuth(CourseRequiredAssignedListPage);
