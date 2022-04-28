import { AxiosInstance } from 'axios';
import debounce from 'lodash/debounce';
import { useEffect, useState } from 'react';

export default function useMultiAsyncInput({
  http,
  apiPath,
  apiParams = {},
  formikFieldValue,
  fieldName = 'name',
  debounceRate = 300,
  initialSelectedOptions,
}: {
  http: AxiosInstance['get'];
  apiPath: string;
  apiParams?: any;
  formikFieldValue: string[];
  fieldName?: string;
  debounceRate?: number;
  initialSelectedOptions?: any[];
}) {
  const [options, setOptions] = useState([]);
  const [cachedOptions, setCachedOptions] = useState<any[]>([]);
  const [inputValues, setInputValues] = useState(undefined);

  useEffect(() => {
    setInputValues(
      formikFieldValue.map((ffv: string) => {
        return {
          label: cachedOptions.find((co) => co.id === ffv)?.[fieldName] || '',
          value: ffv,
        };
      }),
    );
  }, [formikFieldValue, cachedOptions]);

  useEffect(() => {
    if (initialSelectedOptions?.length > 0) {
      setCachedOptions([...cachedOptions, ...initialSelectedOptions]);
    }
  }, [initialSelectedOptions]);

  const searchOptions = async (search: string, callback: any) => {
    const params: any = { perPage: 50, ...apiParams };

    if (search) {
      params.search = search;
      params.searchField = fieldName;
    }

    const { data } = await http(apiPath, {
      params,
    });
    setOptions(data.data);
    setCachedOptions([
      ...cachedOptions,
      ...data.data.filter((fo) => !cachedOptions.find((so) => so.id === fo.id)),
    ]);

    callback(
      data.data
        .sort((a, b) => a[fieldName].localeCompare(b[fieldName]))
        .map((opt) => ({ label: opt[fieldName], value: opt.id })),
    );
  };

  const getOptions = debounce(searchOptions, debounceRate);

  const onValueChange = (values: string[]) => {
    const filteredOptions = options.filter(
      (o) => !!values.find((v) => v === o.id),
    );

    if (filteredOptions.length > 0) {
      setCachedOptions([
        ...cachedOptions,
        ...filteredOptions.filter(
          (fo) => !cachedOptions.find((so) => so.id === fo.id),
        ),
      ]);
    }
  };

  return { options, cachedOptions, getOptions, onValueChange, inputValues };
}
