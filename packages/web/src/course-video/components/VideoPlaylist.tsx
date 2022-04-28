import Link from 'next/link';
import cx from 'classnames';
import { MediaExtended } from '../../models/media';
import ProgressBadge from './ProgressBadge';
import { ClockGray } from '../../ui-kit/icons';
import WEB_PATHS from '../../constants/webPaths';
import { getMediaDurationText } from '../../utils/date';
import useTranslation from '../../i18n/useTranslation';

interface IVideoPlaylistProps {
  courseId: string;
  mediaList: MediaExtended[];
  mediaIndex: number;
  show: boolean;
  onClickPlaylistItem: () => void;
}

function VideoPlaylist({
  courseId,
  mediaList,
  mediaIndex,
  show,
  onClickPlaylistItem,
}: IVideoPlaylistProps) {
  const { t } = useTranslation();

  if (!show) return null;

  return (
    <div className="w-full border-t border-black bg-gray-700 lg:h-full lg:w-auto lg:border-r">
      {mediaList.map((media, index) => (
        <Link
          key={index}
          href={WEB_PATHS.COURSE_VIDEO_PLAYER.replace(':id', courseId).replace(
            ':videoId',
            media.id,
          )}
        >
          <a
            className={cx('flex p-4', {
              'bg-gray-700 hover:bg-gray-650': index !== mediaIndex,
              'bg-black': index === mediaIndex,
            })}
            onClick={() => onClickPlaylistItem()}
          >
            <ProgressBadge
              percentage={media?.percentage}
              sequence={index + 1}
            />
            <div className="ml-2 flex flex-1 flex-col">
              <div className="mb-1 flex-1 text-caption text-white lg:w-44">
                {media.title}
              </div>
              <div className="flex flex-shrink-0 items-center text-footnote text-gray-500">
                <ClockGray className="mr-1 h-3 w-3" />
                {getMediaDurationText(media.duration)}
              </div>
              {index === mediaIndex && (
                <div className="mt-2.5 flex h-5 w-24 items-center justify-center rounded-2xl bg-gray-650 text-footnote font-semibold text-white">
                  {t('courseVideoPlayerPage.nowPlaying')}
                </div>
              )}
            </div>
          </a>
        </Link>
      ))}
    </div>
  );
}

export default VideoPlaylist;
