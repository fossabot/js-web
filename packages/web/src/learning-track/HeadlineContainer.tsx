import { useMemo } from 'react';

import HeadlineContainerSkeleton from '../shared/skeletons/HeadlineContainerSkeleton';

interface IHeadlineContainer {
  name: string;
  description?: string;
  loading?: boolean;
  children?: React.ReactNode;
}

export default function HeadlineContainer({
  name,
  description,
  loading,
  children,
}: IHeadlineContainer) {
  const content = useMemo(() => {
    if (loading) {
      return <HeadlineContainerSkeleton />;
    }
    return (
      <>
        <h1 className="mb-2 text-title-desktop font-bold line-clamp-2">
          {name}
        </h1>
        {!!description && (
          <div className="mb-6 text-caption">{description}</div>
        )}
        {children}
      </>
    );
  }, [loading, name, description, children]);

  return (
    <div className="m-6 border-b border-gray-200 lg:mx-0 lg:mt-12 lg:mb-8 lg:px-4">
      {content}
    </div>
  );
}
