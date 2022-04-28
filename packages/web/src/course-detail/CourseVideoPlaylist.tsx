import cx from 'classnames';
import useTranslation from '../i18n/useTranslation';
import { ICourseDetail } from '../models/course';
import { MediaExtended } from '../models/media';
import { ClockGray, ViewList } from '../ui-kit/icons';
import { getMediaDurationText } from '../utils/date';
import ProgressRingOutline from './ProgressRingOutline';

interface IPlaylistItemProps {
  video: MediaExtended;
  sequence: number;
  last: boolean;
}

function PlaylistItem({ video, sequence, last = false }: IPlaylistItemProps) {
  return (
    <div
      className={cx('m-0.5 flex border-gray-200 p-4', { 'border-b': !last })}
    >
      <div className="mr-4">
        <ProgressRingOutline
          percentage={video.percentage}
          sequence={sequence}
        />
      </div>
      <div className="flex-1">
        <div className="mb-2.5 text-subheading font-bold">{video.title}</div>
        <div className="mb-4 flex flex-shrink-0 items-center text-footnote text-gray-500">
          <ClockGray className="mr-1 h-3 w-3" />
          {getMediaDurationText(video.duration)}
        </div>
        <div className="text-caption text-gray-650 line-clamp-2">
          {video.description}
        </div>
      </div>
    </div>
  );
}

export interface ICourseVideoPlaylistProps {
  courseDetail: ICourseDetail;
  videos: MediaExtended[];
}

function CourseVideoPlaylist({ videos }: ICourseVideoPlaylistProps) {
  const { t } = useTranslation();

  return (
    <div>
      <div className="mt-8 mb-6 flex items-center text-heading font-semibold text-black lg:mt-6">
        <ViewList className="mr-3" />
        <span>{t('courseDetailPage.playlist')}</span>
      </div>
      <div className="rounded-3xl border border-gray-200 bg-gray-100">
        {videos.map((video, index) => (
          <PlaylistItem
            key={index}
            sequence={index + 1}
            video={video}
            last={index === videos.length - 1}
          />
        ))}
      </div>
    </div>
  );
}

export default CourseVideoPlaylist;
