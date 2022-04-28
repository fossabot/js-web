import Link from 'next/link';
import { ArrowLeft } from '../../ui-kit/icons';
import WEB_PATHS from '../../constants/webPaths';
import { Topic } from '../../models/topic';

export default function Breadcrumb({ topic }: { topic?: Topic }) {
  if (!topic) return null;

  return (
    <Link href={`${WEB_PATHS.CATALOG_TOPICS}/${topic.id}`}>
      <a className="mb-4 flex items-center text-caption font-semibold text-brand-primary">
        <ArrowLeft className="mr-1 inline h-4 w-4" />
        {topic.name}
      </a>
    </Link>
  );
}
