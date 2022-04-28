import Head from 'next/head';
import Layout from '../layouts/main.layout';
import UserSidebar from '../ui-kit/sidebars/UserSidebar';
import useTranslation from '../i18n/useTranslation';
import Button from '../ui-kit/Button';
import { Plus } from '../ui-kit/icons';
import { AddressCard } from './AddressCard';
import { useAddressListPage } from './useAddressListPage';
import { ConfirmRemoveAddressModal } from './ConfirmRemoveAddressModal';
import { useEffect } from 'react';
import Link from 'next/link';
import WEB_PATHS from '../constants/webPaths';
import { captureError } from '../utils/error-routing';

function AddressListPage(props: any) {
  const { t } = useTranslation();
  const {
    handleRemoveAddress,
    handleConfirmRemoveAddress,
    confirmRemoveAddressModalProps,
    listMyTaxInvoices,
    myTaxInvoices,
  } = useAddressListPage();

  useEffect(() => {
    listMyTaxInvoices().catch(captureError);
  }, []);

  return (
    <Layout token={props.token} sidebar={<UserSidebar />} includeSidebar={true}>
      <Head>
        <title>
          {t('headerText')} | {t('addressListPage.metaTitle')}
        </title>
      </Head>
      <section className="flex items-center justify-between 2xl:mx-auto 2xl:w-278">
        <div className="text-subheading font-bold">
          {t('addressListPage.title')}
        </div>
        <Link href={WEB_PATHS.MANAGE_ADDRESS_CREATE}>
          <a>
            <Button className="flex space-x-2 px-5 py-2 text-body font-semibold">
              <Plus />
              <div>{t('addressListPage.addNew')}</div>
            </Button>
          </a>
        </Link>
      </section>
      <section className="gap-4 space-y-8 pt-6 lg:grid lg:grid-cols-2 lg:space-y-0 2xl:mx-auto 2xl:w-278">
        {myTaxInvoices.map((taxInvoice) => (
          <AddressCard
            key={taxInvoice.id}
            userTaxInvoice={taxInvoice}
            onRemove={handleRemoveAddress}
          />
        ))}
      </section>
      <ConfirmRemoveAddressModal
        {...confirmRemoveAddressModalProps}
        onOk={handleConfirmRemoveAddress}
      />
    </Layout>
  );
}

export default AddressListPage;
