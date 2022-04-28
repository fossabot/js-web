import { useMediaQuery } from 'react-responsive';
import resolveConfig from 'tailwindcss/resolveConfig';
import config from '../../tailwind.config';

const { theme } = resolveConfig(config);

export const useResponsive = () => {
  const sm = useMediaQuery({ query: `(min-width: ${theme.screens.sm})` });
  const md = useMediaQuery({ query: `(min-width: ${theme.screens.md})` });
  const lg = useMediaQuery({ query: `(min-width: ${theme.screens.lg})` });
  const xl = useMediaQuery({ query: `(min-width: ${theme.screens.xl})` });
  const xxl = useMediaQuery({ query: `(min-width: ${theme.screens.xxl})` });

  return { sm, md, lg, xl, xxl };
};
