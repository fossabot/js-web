import { useRouter } from 'next/router';

export default function useLearningTrackFilters() {
  const router = useRouter();

  const topicId = router.query.topicId as string;
  const category = router.query.category as string;
  const hasCertificate = router.query.hasCertificate as string;
  const assigned = router.query.assigned as string;

  const hasActiveFilters = !!category || !!hasCertificate || !!assigned;

  return {
    topicId,
    category,
    hasCertificate,
    hasActiveFilters,
    assigned,
    pathname: router.pathname,
  };
}
