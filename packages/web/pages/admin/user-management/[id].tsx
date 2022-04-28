import withAuth from '../../../src/app-state/auth';
import { UserProfilePage } from '../../../src/admin/UserProfilePage';

export default withAuth(UserProfilePage);
