import { useRouter } from 'next/router';
import { stringifyUrl } from 'query-string';
import { useEffect, useState } from 'react';
import { LearningTrackDirectAccessorType } from '../../models/learningTrackDirectAccess';

function useAccessorType() {
  const accessorTypeOptions: {
    label: string;
    value: LearningTrackDirectAccessorType;
  }[] = [
    { label: 'User', value: LearningTrackDirectAccessorType.User },
    { label: 'Group', value: LearningTrackDirectAccessorType.Group },
    {
      label: 'Organization',
      value: LearningTrackDirectAccessorType.Organization,
    },
  ];
  const [accessorType, setAccessorType] =
    useState<LearningTrackDirectAccessorType>(
      LearningTrackDirectAccessorType.User,
    );
  const router = useRouter();

  useEffect(() => {
    if (!router.query.accessorType) {
      handleAccessorTypeChange(LearningTrackDirectAccessorType.User, true);
    }
  }, []);

  useEffect(() => {
    if (
      router.query.accessorType &&
      router.query.accessorType !== accessorType
    ) {
      setAccessorType(
        router.query.accessorType as LearningTrackDirectAccessorType.User,
      );
    }
  }, [router.query.accessorType]);

  const handleAccessorTypeChange = (val: string, replace = false) => {
    const url = stringifyUrl({
      url: router.pathname,
      query: {
        ...router.query,
        accessorType: val,
      },
    });

    if (!replace) {
      router.push(url);
    } else {
      router.replace(url);
    }
  };

  return {
    accessorType,
    accessorTypeOptions,
    handleAccessorTypeChange,
  };
}

export default useAccessorType;
