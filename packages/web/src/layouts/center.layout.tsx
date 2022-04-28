import Head from 'next/head';
import Footer from '../ui-kit/footer/Footer';

interface ILayoutProps {
  head?: React.ReactNode;
  header?: React.ReactNode;
  children: React.ReactNode;
}

const defaultHead = (
  <Head>
    <link rel="icon" href="/favicon.ico" />
  </Head>
);

export default function CenterLayout({
  children,
  header,
  head = defaultHead,
}: ILayoutProps) {
  return (
    <div className="flex min-h-full flex-col bg-white">
      {head}
      {header}
      <main className="flex flex-1 items-center justify-center lg:mx-auto lg:w-256">
        {children}
      </main>
      <Footer />
    </div>
  );
}
