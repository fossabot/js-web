import { FC } from 'react';
import Head from 'next/head';
import Layout from '../layouts/main.layout';
import UserSidebar from '../ui-kit/sidebars/UserSidebar';
import useTranslation from '../i18n/useTranslation';
import {
  addressFormSchema,
  AddressFormSchema,
  BillingAddressOption,
} from './AddressForm.schema';
import { Formik } from 'formik';
import { OfficeType, TaxType } from '../models/baseTaxInvoice';

import { AddressForm } from './AddressForm';
import Button from '../ui-kit/Button';
import ErrorMessages from '../ui-kit/ErrorMessage';
import SuccessMessage from '../ui-kit/SuccessMessage';
import { useAddressCreatePage } from './useAddressCreatePage';
import { ITokenProps } from '../models/auth';

interface IAddressCreatePage {
  token: ITokenProps;
}

const AddressCreatePage: FC<IAddressCreatePage> = (props) => {
  const { token } = props;
  const { t } = useTranslation();
  const { saveChanges, saveSuccessMessage, saveErrorMessage, onCancel } =
    useAddressCreatePage();

  return (
    <Layout token={token} sidebar={<UserSidebar />} includeSidebar={true}>
      <Head>
        <title>{t('addressEditPage.metaTitle')}</title>
      </Head>
      <Formik<AddressFormSchema>
        initialValues={{
          taxType: TaxType.INDIVIDUAL,
          taxEntityName: '',
          officeType: OfficeType.HEAD_OFFICE,
          branch: '',
          taxId: '',
          taxCountry: t('address.thailand'),
          taxProvince: null,
          taxDistrict: null,
          taxSubdistrict: null,
          taxPostalCode: null,
          taxAddress: '',
          taxContactPerson: '',
          taxContactEmail: '',
          taxContactPhoneNumber: '',
          billingOption: BillingAddressOption.SAME_AS_INVOICE,
          billingCountry: t('address.thailand'),
          billingProvince: null,
          billingDistrict: null,
          billingSubdistrict: null,
          billingPostalCode: null,
          billingAddress: '',
        }}
        validationSchema={addressFormSchema}
        onSubmit={(value) => saveChanges(value)}
      >
        {(formik) => (
          <form
            className="lg:w-max-1/2 lg:mx-auto"
            onSubmit={formik.handleSubmit}
          >
            <ErrorMessages
              messages={saveErrorMessage.message}
              onClearAction={saveErrorMessage.clearMessage}
            />
            <SuccessMessage
              title={saveSuccessMessage.message}
              onClearAction={saveSuccessMessage.clearMessage}
            />
            <div className="mb-8 text-heading font-bold">
              {t('addressCreatePage.addNewInvoiceAddress')}
            </div>
            <AddressForm formik={formik} />
            <hr className="mt-8 border-gray-200" />
            <div className="sticky bottom-0 flex space-x-4 bg-white py-4 lg:static lg:flex lg:justify-end lg:py-8">
              <Button
                className="flex-grow lg:flex-none"
                avoidFullWidth
                variant="secondary"
                size="medium"
                type="reset"
                onClick={onCancel}
              >
                {t('addressEditPage.cancel')}
              </Button>
              <Button
                className="w-2/3 flex-grow lg:w-auto lg:flex-none"
                avoidFullWidth
                variant="primary"
                size="medium"
                type="submit"
                isLoading={formik.isSubmitting}
              >
                {t('addressEditPage.saveChanges')}
              </Button>
            </div>
          </form>
        )}
      </Formik>
    </Layout>
  );
};

export default AddressCreatePage;
