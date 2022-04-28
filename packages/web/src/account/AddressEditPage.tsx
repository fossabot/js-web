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
import { useAddressEditPage } from './useAddressEditPage';
import { AddressForm } from './AddressForm';
import Button from '../ui-kit/Button';
import ErrorMessages from '../ui-kit/ErrorMessage';
import SuccessMessage from '../ui-kit/SuccessMessage';
import { ITokenProps } from '../models/auth';

interface IAddressEditPage {
  token: ITokenProps;
}

const AddressEditPage: FC<IAddressEditPage> = (props) => {
  const { token } = props;
  const { t } = useTranslation();
  const {
    myTaxInvoice,
    saveChanges,
    saveSuccessMessage,
    saveErrorMessage,
    onCancel,
  } = useAddressEditPage();

  return (
    <Layout token={token} sidebar={<UserSidebar />} includeSidebar={true}>
      <Head>
        <title>{t('addressEditPage.metaTitle')}</title>
      </Head>
      <Formik<AddressFormSchema>
        initialValues={{
          taxType: myTaxInvoice?.taxType || TaxType.INDIVIDUAL,
          taxEntityName: myTaxInvoice?.taxEntityName,
          officeType: myTaxInvoice?.officeType || OfficeType.HEAD_OFFICE,
          branch: myTaxInvoice?.headOfficeOrBranch || '',
          taxId: myTaxInvoice?.taxId,
          taxCountry: myTaxInvoice?.country || t('address.thailand'),
          taxProvince: myTaxInvoice?.province,
          taxDistrict: myTaxInvoice?.district,
          taxSubdistrict: myTaxInvoice?.subdistrict,
          taxPostalCode: myTaxInvoice?.subdistrict,
          taxAddress: myTaxInvoice?.taxAddress,
          taxContactPerson: myTaxInvoice?.contactPerson,
          taxContactEmail: myTaxInvoice?.contactEmail,
          taxContactPhoneNumber: myTaxInvoice?.contactPhoneNumber,
          billingOption: myTaxInvoice?.billingAddress
            ? BillingAddressOption.ADD_NEW
            : BillingAddressOption.SAME_AS_INVOICE,
          billingCountry:
            myTaxInvoice?.billingAddress?.country || t('address.thailand'),
          billingProvince: myTaxInvoice?.billingAddress?.province,
          billingDistrict: myTaxInvoice?.billingAddress?.district,
          billingSubdistrict: myTaxInvoice?.billingAddress?.subdistrict,
          billingPostalCode: myTaxInvoice?.billingAddress?.subdistrict,
          billingAddress: myTaxInvoice?.billingAddress?.billingAddress || '',
        }}
        enableReinitialize
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
              {t('addressEditPage.editAddress')}
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

export default AddressEditPage;
