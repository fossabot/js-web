import Head from 'next/head';

import Header from '../ui-kit/header';
import { ITokenProps } from '../models/auth';
import useTranslation from '../i18n/useTranslation';

interface ILayoutProps {
  token?: ITokenProps;
  children: React.ReactNode;
}

export default function Layout({ children, token }: ILayoutProps) {
  const { t } = useTranslation();

  return (
    <div className="flex h-screen flex-col bg-gray-100">
      <Head>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header token={token} title={t('headerText')} />
      <main className="flex flex-1 flex-col overflow-y-auto p-5">
        {children}
      </main>
    </div>
  );
}
