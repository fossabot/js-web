import { useIntl } from 'react-intl';

const useTranslation = () => {
  const { formatMessage } = useIntl();
  const t = (id: string, values = undefined) => formatMessage({ id }, values);

  return { t };
};

export default useTranslation;
