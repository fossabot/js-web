import withAuth from '../../../src/app-state/auth';
import { VideoListPage } from '../../../src/video-management/VideoListPage';

export default withAuth(VideoListPage);
