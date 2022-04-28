import Link from 'next/link';
import { useRouter } from 'next/router';

import { ArrowLeft } from '../ui-kit/icons';
import WEB_PATHS from '../constants/webPaths';
import { ILearningTrackDetail } from '../models/learningTrack';

// We can probably resuse Breadcrumb component in courseDetail and Learning Track Detail Page.
export default function Breadcrumb({
  learningTrackDetail,
}: {
  learningTrackDetail: ILearningTrackDetail;
}) {
  const router = useRouter();

  if (router.query.topicId) {
    const topic = learningTrackDetail.topics.find(
      (t) => t.id === router.query.topicId,
    );

    if (!topic) {
      return null;
    }

    // TODO: Change this link after list page is integrated.
    return (
      <Link href={`${WEB_PATHS.CATALOG_TOPICS}/${topic.id}`}>
        <a className="mb-3 flex items-center text-caption font-semibold text-brand-primary">
          <ArrowLeft className="mr-1 inline h-4 w-4" />
          {topic.name}
        </a>
      </Link>
    );
  }

  return null;
}
