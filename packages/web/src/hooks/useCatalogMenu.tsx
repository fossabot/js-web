import { createContext, useContext, useEffect, useState } from 'react';
import { useAuthInfo } from '../app-state/useAuthInfo';
import API_PATHS from '../constants/apiPaths';
import { centralHttp } from '../http';
import { CatalogMenu } from '../models/catalog-menu';

let cachedCatalogMenu = undefined;
export interface ICatalogMenuContext {
  catalogMenu: CatalogMenu | undefined;
  isLoading: boolean;
}

export const CatalogMenuContext = createContext<ICatalogMenuContext>({
  catalogMenu: undefined,
  isLoading: false,
});

export function useCatalogMenu(): ICatalogMenuContext {
  return useContext(CatalogMenuContext);
}

async function fetchCatalogMenu() {
  const res = await centralHttp.get(API_PATHS.CATALOG_MENU);
  return res.data.data;
}

export function CatalogMenuProvider({ children }) {
  const [isLoading, setIsLoading] = useState(false);
  const { context: authContext } = useAuthInfo();

  async function getCatalogMenu() {
    setIsLoading(true);
    try {
      const menu = await fetchCatalogMenu();
      cachedCatalogMenu = menu;
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (!isLoading && !cachedCatalogMenu && authContext?.token) {
      getCatalogMenu();
    }
  }, [authContext]);

  return (
    <CatalogMenuContext.Provider
      value={{ catalogMenu: cachedCatalogMenu, isLoading }}
    >
      {children}
    </CatalogMenuContext.Provider>
  );
}

export function withCatalogMenu(WrappedComponent) {
  return <CatalogMenuProvider>{WrappedComponent}</CatalogMenuProvider>;
}
