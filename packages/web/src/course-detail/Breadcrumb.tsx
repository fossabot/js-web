import Link from 'next/link';
import { useRouter } from 'next/router';

import { ArrowLeft } from '../ui-kit/icons';
import WEB_PATHS from '../constants/webPaths';
import { ICourseDetail } from '../models/course';

export default function Breadcrumb({
  courseDetail,
}: {
  courseDetail: ICourseDetail;
}) {
  const router = useRouter();

  if (router.query.topicId) {
    const topic = courseDetail.topics.find(
      (t) => t.id === router.query.topicId,
    );

    if (!topic) {
      return null;
    }

    return (
      <Link href={`${WEB_PATHS.CATALOG_TOPICS}/${topic.id}`}>
        <a className="flex items-center text-caption font-semibold text-brand-primary">
          <ArrowLeft className="mr-1 inline h-4 w-4" />
          {topic.name}
        </a>
      </Link>
    );
  }

  if (router.query.learningWayId) {
    const learningWay = courseDetail.courseOutlines
      .map((c) => c.learningWay)
      .find((lw) => lw.id === router.query.learningWayId);

    if (!learningWay) {
      return null;
    }

    return (
      <Link href={`${WEB_PATHS.CATALOG_LEARNING_WAYS}/${learningWay.id}`}>
        <a className="flex items-center text-caption font-semibold text-brand-primary">
          {learningWay.name}
        </a>
      </Link>
    );
  }

  return null;
}
