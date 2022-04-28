import Link from 'next/link';
import cx from 'classnames';
import { useMemo } from 'react';
import { padStart } from 'lodash';
import WEB_PATHS from '../../constants/webPaths';
import useTranslation from '../../i18n/useTranslation';
import { Media } from '../../models/media';
import {
  BurgerMenu,
  VideoRewind,
  VideoForward,
  Close,
} from '../../ui-kit/icons';

interface IVideoNavigationProps {
  courseId: string;
  mediaList: Media[];
  currentMedia: Media;
  mediaIndex: number;
  showOutline: boolean;
  onToggleShowOutline: () => void;
}

function VideoNavigation({
  courseId,
  mediaList,
  currentMedia,
  mediaIndex,
  showOutline,
  onToggleShowOutline,
}: IVideoNavigationProps) {
  const { t } = useTranslation();

  const displayNumber = useMemo(
    () => padStart((mediaIndex + 1).toString(), 2, '0'),
    [mediaIndex],
  );

  const prevLink = useMemo(() => {
    if (mediaIndex > 0) {
      return WEB_PATHS.COURSE_VIDEO_PLAYER.replace(':id', courseId).replace(
        ':videoId',
        mediaList[mediaIndex - 1].id,
      );
    } else {
      return '';
    }
  }, [mediaIndex]);

  const nextLink = useMemo(() => {
    if (mediaIndex < mediaList.length - 1) {
      return WEB_PATHS.COURSE_VIDEO_PLAYER.replace(':id', courseId).replace(
        ':videoId',
        mediaList[mediaIndex + 1].id,
      );
    } else {
      return '';
    }
  }, [mediaIndex]);

  const hasPrev = useMemo(() => mediaIndex > 0, [mediaIndex]);
  const hasNext = useMemo(
    () => mediaIndex < mediaList.length - 1,
    [mediaIndex],
  );

  return (
    <div className="flex w-full select-none items-center justify-between border-t border-black bg-gray-700 text-caption text-white lg:relative">
      {mediaList?.length > 1 && (
        <div
          className={cx(
            'flex h-full flex-none cursor-pointer items-center justify-center border-r border-black px-6 py-3 hover:bg-gray-650 lg:w-40 lg:flex-shrink lg:px-0',
            { 'bg-gray-650': showOutline },
          )}
          onClick={() => onToggleShowOutline()}
        >
          {showOutline ? (
            <>
              <Close className="mr-2.5 w-4" />
              <span className="flex-none">
                {t('courseVideoPlayerPage.hideOutline')}
              </span>
            </>
          ) : (
            <>
              <BurgerMenu className="mr-2.5 w-4" />
              <span className="flex-none">
                {t('courseVideoPlayerPage.showOutline')}
              </span>
            </>
          )}
        </div>
      )}
      <div className="hidden h-full flex-1 items-center border-r border-black px-4 py-3 lg:flex">
        {`${displayNumber} ${currentMedia.title}`}
      </div>
      {hasPrev ? (
        <Link href={prevLink}>
          <a className="flex flex-1 cursor-pointer items-center justify-center border-r border-black px-1 py-3 hover:bg-gray-650 lg:w-26 lg:flex-none">
            <VideoRewind className="mr-2.5 w-4" />
            <span>{t('courseVideoPlayerPage.prev')}</span>
          </a>
        </Link>
      ) : (
        <div className="flex flex-1 cursor-not-allowed items-center justify-center border-r border-black px-1 py-3 opacity-75 lg:w-26 lg:flex-none">
          <VideoRewind className="mr-2.5 w-4" />
          <span>{t('courseVideoPlayerPage.prev')}</span>
        </div>
      )}
      {hasNext ? (
        <Link href={nextLink}>
          <a className="flex flex-1 cursor-pointer items-center justify-center px-1 py-3 hover:bg-gray-650 lg:w-26 lg:flex-none lg:px-0">
            <span>{t('courseVideoPlayerPage.next')}</span>
            <VideoForward className="ml-2.5 w-4" />
          </a>
        </Link>
      ) : (
        <div className="flex flex-1 cursor-not-allowed items-center justify-center px-1 py-3 opacity-75 lg:w-26 lg:flex-none lg:px-0">
          <span>{t('courseVideoPlayerPage.next')}</span>
          <VideoForward className="ml-2.5 w-4" />
        </div>
      )}
    </div>
  );
}

export default VideoNavigation;
