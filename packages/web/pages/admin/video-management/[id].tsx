import withAuth from '../../../src/app-state/auth';
import { VideoEditPage } from '../../../src/video-management/VideoEditPage';

export default withAuth(VideoEditPage);
