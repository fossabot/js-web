import { AxiosInstance } from 'axios';
import debounce from 'lodash/debounce';
import { useEffect, useState } from 'react';

export default function useAsyncInput({
  http,
  apiPath,
  apiParams = {},
  formikFieldValue,
  filterOptionsFunc,
  customLabel,
  fieldName = 'name',
  debounceRate = 300,
  allowSearch = true,
  perPage = 50,
}: {
  http: AxiosInstance['get'];
  apiPath: string;
  apiParams?: any;
  formikFieldValue: string;
  customLabel?: (arg: any) => any;
  fieldName?: string;
  debounceRate?: number;
  allowSearch?: boolean;
  perPage?: number;
  filterOptionsFunc?: (arg: any) => any;
}) {
  const [options, setOptions] = useState([]);
  const [inputValue, setInputValue] = useState({ label: '', value: '' });

  useEffect(() => {
    setInputValue({
      label:
        (customLabel
          ? customLabel(options.find((o) => o.id === formikFieldValue))
          : options.find((o) => o.id === formikFieldValue)?.[fieldName]) || '',
      value: formikFieldValue,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formikFieldValue, options]);

  const searchOptions = async (search: string, callback: any) => {
    const params: any = { perPage, ...apiParams };

    if (search) {
      params.search = search;
      params.searchField = fieldName;
    }

    const { data } = await http(apiPath, {
      params,
    });
    setOptions(data.data);

    callback(
      data.data
        .sort((a, b) => a[fieldName].localeCompare(b[fieldName]))
        .map((opt) => ({
          label: customLabel ? customLabel(opt) : opt[fieldName],
          value: opt.id,
          data: opt,
        })),
    );
  };

  const findOptions = () => {
    return new Promise(async (resolve) => {
      const { data } = await http(apiPath);

      const opts = filterOptionsFunc
        ? data.data.filter(filterOptionsFunc)
        : data.data;
      setOptions(opts);

      resolve(
        opts
          .sort((a, b) => a[fieldName].localeCompare(b[fieldName]))
          .map((opt) => ({ label: opt[fieldName], value: opt.id, data: opt })),
      );
    });
  };

  const getOptions = allowSearch
    ? debounce(searchOptions, debounceRate)
    : findOptions;

  return { options, getOptions, inputValue };
}
