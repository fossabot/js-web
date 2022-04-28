import { Media } from '../../models/media';
import { ClockGray } from '../../ui-kit/icons';
import { getMediaDurationText } from '../../utils/date';

interface IChapterDetailProps {
  media: Media;
}

function ChapterDetail({ media }: IChapterDetailProps) {
  return (
    <div className="mb-2.5 border-b border-gray-200 bg-gray-100 p-8 pt-6">
      <div className="lg:mx-auto lg:w-179">
        <h1 className="mb-2.5 text-subheading font-bold">{media?.title}</h1>
        <div className="mb-4 flex items-center text-caption text-gray-500">
          <ClockGray className="mr-1" />
          <span>{getMediaDurationText(media?.duration)}</span>
        </div>
        <div className="text-caption leading-4">{media?.description}</div>
      </div>
    </div>
  );
}

export default ChapterDetail;
