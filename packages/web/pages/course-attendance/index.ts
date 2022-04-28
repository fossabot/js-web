import withAuth from '../../src/app-state/auth';
import { CourseAttendanceListPage } from '../../src/course-attendance/CourseAttendanceListPage';

export default withAuth(CourseAttendanceListPage);
