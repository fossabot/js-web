import cx from 'classnames';
import { ClockGray } from '../../ui-kit/icons';
import { getMediaDurationText } from '../../utils/date';
import ProgressBadge from './ProgressBadge';

interface IVideoCaptionProps {
  title: string;
  duration: number;
  mediaIndex: number;
  showOutline: boolean;
  percentage: number;
}

function VideoCaption({
  title,
  duration = 0,
  mediaIndex,
  showOutline,
  percentage = 0,
}: IVideoCaptionProps) {
  return (
    <div
      className={cx('flex w-full items-center bg-gray-700 p-4 lg:hidden', {
        hidden: showOutline,
      })}
    >
      <ProgressBadge sequence={mediaIndex + 1} percentage={percentage} />
      <div className="ml-4 mr-2.5 flex-1 text-caption text-white">{title}</div>
      <div className="flex flex-shrink-0 items-center justify-between text-footnote text-gray-500">
        <ClockGray className="mr-1" /> {getMediaDurationText(duration)}
      </div>
    </div>
  );
}

export default VideoCaption;
