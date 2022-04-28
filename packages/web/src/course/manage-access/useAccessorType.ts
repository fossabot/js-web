import { useRouter } from 'next/router';
import { stringifyUrl } from 'query-string';
import { useEffect, useState } from 'react';

function useAccessorType() {
  const accessorTypeOptions = [
    { label: 'User', value: 'user' },
    { label: 'Group', value: 'group' },
    { label: 'Organization', value: 'organization' },
  ];
  const [accessorType, setAccessorType] = useState<string>('user');
  const router = useRouter();

  useEffect(() => {
    if (!router.query.accessorType) {
      handleAccessorTypeChange('user', true);
    }
  }, []);

  useEffect(() => {
    if (
      router.query.accessorType &&
      router.query.accessorType !== accessorType
    ) {
      setAccessorType(router.query.accessorType as string);
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
