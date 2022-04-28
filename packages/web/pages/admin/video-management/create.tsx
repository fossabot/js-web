import withAuth from '../../../src/app-state/auth';
import { VideoCreatePage } from '../../../src/video-management/VideoCreatePage';

export default withAuth(VideoCreatePage);
