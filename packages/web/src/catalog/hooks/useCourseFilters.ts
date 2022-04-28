import { useRouter } from 'next/router';

export default function useCourseFilters() {
  const router = useRouter();
  const categoryKey = router.query.categoryKey as string;
  const subCategoryKey = router.query.subCategoryKey as string;
  const language = router.query.language as string;
  const duration = router.query.duration as string;
  const hasCertificate = router.query.hasCertificate as string;
  const assigned = router.query.assigned as string;
  const required = router.query.required as string;
  const durationStartStr = router.query.durationStart as string;
  const durationEndStr = router.query.durationEnd as string;

  const durationStart = !!durationStartStr
    ? parseInt(durationStartStr)
    : undefined;
  const durationEnd = !!durationEndStr ? parseInt(durationEndStr) : undefined;

  const haveActiveFilters =
    !!categoryKey ||
    !!subCategoryKey ||
    !!language ||
    !!duration ||
    !!hasCertificate ||
    !!assigned ||
    !!required;

  return {
    pathname: router.pathname,
    categoryKey,
    subCategoryKey,
    durationStart,
    durationEnd,
    language,
    duration,
    hasCertificate,
    haveActiveFilters,
    assigned,
    required,
  };
}
