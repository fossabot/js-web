import { FormikProps } from 'formik';
import { FunctionComponent, useEffect } from 'react';
import useTranslation from '../i18n/useTranslation';
import { UserTaxInvoice } from '../models/userTaxInvoice';
import InputSection from '../ui-kit/InputSection';
import InputSelect from '../ui-kit/InputSelect';
import cx from 'classnames';
import RadioButton from '../ui-kit/RadioButton';
import {
  BillingAddressOption,
  OfficeType,
  PaymentForm,
  TaxType,
} from './paymentForm.schema';
import { BillingAddressForm } from './BillingAddressForm';
import { Close, Plus } from '../ui-kit/icons';
import Button from '../ui-kit/Button';
import { useAddressListPage } from '../account/useAddressListPage';

export interface IInvoice {
  formik: FormikProps<PaymentForm>;
}
export const Invoice: FunctionComponent<IInvoice> = (props) => {
  const { formik } = props;
  const { t } = useTranslation();

  const { listMyTaxInvoices, myTaxInvoices } = useAddressListPage();

  useEffect(() => {
    listMyTaxInvoices();
  }, []);

  const prefillInvoice = (event) => {
    const invoice = event.target.value as UserTaxInvoice;

    const { billingAddress, ...rest } = invoice;

    formik.setValues((values) => {
      const newValue: PaymentForm = {
        ...values,
        ...rest,
        taxCountry: invoice.country,
        taxProvince: invoice.province,
        taxDistrict: invoice.district,
        taxSubdistrict: invoice.subdistrict,
        taxPostalCode: invoice.subdistrict,
        taxContactEmail: invoice.contactEmail,
        taxContactPerson: invoice.contactPerson,
        taxContactPhoneNumber: invoice.contactPhoneNumber,
        branch: invoice.headOfficeOrBranch || '',
        billingOption: BillingAddressOption.SAME_AS_INVOICE,
      };
      if (billingAddress) {
        newValue.billingOption = BillingAddressOption.ADD_NEW;
        newValue.billingAddress = billingAddress.billingAddress;
        newValue.billingCountry = billingAddress.country;
        newValue.billingDistrict = billingAddress.district;
        newValue.billingProvince = billingAddress.province;
        newValue.billingSubdistrict = billingAddress.subdistrict;
        newValue.billingPostalCode = billingAddress.subdistrict;
      }

      return newValue;
    });
  };

  return (
    <>
      <header className="flex items-center">
        <p className="flex-1 text-heading font-bold">
          {t('paymentPage.invoice.invoice')}
        </p>
        {!formik.values.issueTaxInvoice && (
          <div>
            <Button
              type="button"
              variant="secondary"
              onClick={() => formik.setFieldValue('issueTaxInvoice', true)}
              size="medium"
              iconLeft={<Plus className="h-4 w-4 lg:h-5 lg:w-5" />}
              iconWrapperClassName="mr-2"
            >
              <span className="text-caption font-semibold">
                {t('paymentPage.invoice.requestAnInvoice')}
              </span>
            </Button>
          </div>
        )}
      </header>
      <section
        className={cx(formik.values.issueTaxInvoice ? 'block' : 'hidden')}
        aria-hidden={!formik.values.issueTaxInvoice}
      >
        <header className="mt-8 text-caption font-semibold">
          {t('paymentPage.invoice.selectAnAddress')}
        </header>
        <section className="mt-2 flex space-x-6">
          <InputSelect
            name="addressOption"
            renderOptions={myTaxInvoices.map((invoice) => ({
              label: invoice.taxEntityName,
              value: invoice,
            }))}
            onChange={prefillInvoice}
            onBlur={() => null}
            defaultValue={formik.values.addressOption}
          />
          <div className="flex">
            <Button
              variant="secondary"
              size="medium"
              iconLeft={<Close />}
              iconWrapperClassName="mr-2"
              type="button"
              className="flex-grow"
              onClick={() => formik.setFieldValue('issueTaxInvoice', false)}
            >
              <span className="text-body font-semibold">
                {t('paymentPage.invoice.cancel')}
              </span>
            </Button>
          </div>
        </section>
        <header className="mt-8 text-caption font-semibold">
          {t('paymentPage.invoice.invoiceFor')}
        </header>
        <section className="mt-2 space-y-4 text-body lg:flex lg:space-y-0 lg:space-x-6">
          <label className="flex w-full cursor-pointer items-center space-x-3 rounded-xl border border-gray-300 p-4">
            <RadioButton
              inputClassName={'p-3 cursor-pointer'}
              {...formik.getFieldProps('taxType')}
              value={TaxType.INDIVIDUAL}
              checked={formik.values.taxType === TaxType.INDIVIDUAL}
              readOnly
            />
            <span className="font-semibold">
              {t('paymentPage.invoice.individual')}
            </span>
          </label>
          <label className="flex w-full cursor-pointer items-center space-x-3 rounded-xl border border-gray-300 p-4">
            <RadioButton
              inputClassName={'p-3 cursor-pointer'}
              {...formik.getFieldProps('taxType')}
              value={TaxType.ORGANIZATION}
              checked={formik.values.taxType === TaxType.ORGANIZATION}
              readOnly
            />
            <span className="font-semibold">
              {t('paymentPage.invoice.organization')}
            </span>
          </label>
        </section>
        <label>
          <header className="mt-8 text-caption font-semibold">
            {t('paymentPage.invoice.taxEntityName')}
          </header>
          <section className="mt-2">
            <InputSection
              name="taxEntityName"
              placeholder={t('paymentPage.invoice.taxEntityNamePlaceholder')}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.taxEntityName}
              error={
                formik.touched.taxEntityName && formik.errors.taxEntityName
              }
            />
          </section>
        </label>
        <header className="mt-8 text-caption font-semibold">
          {t('paymentPage.invoice.officeType')}
        </header>
        <section className="mt-2 space-y-4 text-body">
          <label className="flex w-full cursor-pointer items-center space-x-3 rounded-xl border border-gray-300 p-4">
            <RadioButton
              inputClassName={'p-3 cursor-pointer'}
              {...formik.getFieldProps('officeType')}
              value={OfficeType.HEAD_OFFICE}
              checked={formik.values.officeType === OfficeType.HEAD_OFFICE}
              readOnly
            />
            <span className="font-semibold lg:font-normal">
              {t('paymentPage.invoice.headOffice')}
            </span>
          </label>
          <label className="flex w-full cursor-pointer items-center space-x-3 rounded-xl border border-gray-300 p-4">
            <RadioButton
              inputClassName={'p-3 cursor-pointer'}
              {...formik.getFieldProps('officeType')}
              value={OfficeType.BRANCH}
              checked={formik.values.officeType === OfficeType.BRANCH}
              readOnly
            />
            <span className="font-semibold lg:font-normal">
              {t('paymentPage.invoice.branch')}
            </span>
          </label>
          <section
            className={cx(
              formik.values.officeType === OfficeType.BRANCH
                ? 'block'
                : 'hidden',
            )}
          >
            <InputSection
              name="branch"
              placeholder={t('paymentPage.invoice.branchPlaceholder')}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.branch}
              error={formik.touched.branch && formik.errors.branch}
            />
          </section>
        </section>
        <hr className="my-8 border-gray-200" />
        <header className="text-subheading font-bold">
          {t('paymentPage.invoice.taxInvoiceInformation')}
        </header>
        <article>
          <label>
            <header className="mt-8 text-caption font-semibold">
              {t('paymentPage.invoice.taxId')}
            </header>
            <section className="mt-2">
              <InputSection
                name="taxId"
                placeholder={t('paymentPage.invoice.taxIdPlaceholder')}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.taxId}
                error={formik.touched.taxId && formik.errors.taxId}
              />
            </section>
          </label>
          <div className="mt-6">
            <BillingAddressForm
              fieldNames={{
                country: 'taxCountry',
                province: 'taxProvince',
                district: 'taxDistrict',
                subdistrict: 'taxSubdistrict',
                postalCode: 'taxPostalCode',
                address: 'taxAddress',
              }}
            />
          </div>
        </article>
        <hr className="my-8 border-gray-200" />
        <article>
          <header className="text-subheading font-bold">
            {t('paymentPage.invoice.contactInformation')}
          </header>
          <section className="mt-8">
            <label className="space-y-2">
              <div className="text-caption font-semibold">
                {t('paymentPage.invoice.contactName')}
              </div>
              <InputSection
                name="taxContactPerson"
                placeholder={t('paymentPage.invoice.contactNamePlaceholder')}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.taxContactPerson}
                error={
                  formik.touched.taxContactPerson &&
                  formik.errors.taxContactPerson
                }
              />
            </label>
          </section>
          <section className="lg:flex lg:space-x-6">
            <section className="mt-8 flex-1">
              <label className="space-y-2">
                <div className="text-caption font-semibold">
                  {t('paymentPage.invoice.emailAddress')}
                </div>
                <InputSection
                  name="taxContactEmail"
                  placeholder={t('paymentPage.invoice.emailAddressPlaceholder')}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.taxContactEmail}
                  error={
                    formik.touched.taxContactEmail &&
                    formik.errors.taxContactEmail
                  }
                />
              </label>
            </section>
            <section className="mt-8 flex-1">
              <label className="space-y-2">
                <div className="text-caption font-semibold">
                  {t('paymentPage.invoice.phoneNumber')}
                </div>
                <InputSection
                  type="phone"
                  name="taxContactPhoneNumber"
                  placeholder={t('paymentPage.invoice.phoneNumberPlaceholder')}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.taxContactPhoneNumber}
                  error={
                    formik.touched.taxContactPhoneNumber &&
                    formik.errors.taxContactPhoneNumber
                  }
                />
              </label>
            </section>
          </section>
        </article>
        <hr className="my-8 border-gray-200" />
        <header className="text-subheading font-bold">
          {t('paymentPage.invoice.billingAddress')}
        </header>
        <article className="mt-8 space-y-8">
          <section className="space-y-4 text-body lg:flex lg:space-x-8 lg:space-y-0">
            <label className="flex w-full cursor-pointer items-center space-x-3 rounded-xl border border-gray-300 p-4">
              <RadioButton
                inputClassName={'p-3 cursor-pointer'}
                {...formik.getFieldProps('billingOption')}
                value={BillingAddressOption.SAME_AS_INVOICE}
                checked={
                  formik.values.billingOption ===
                  BillingAddressOption.SAME_AS_INVOICE
                }
                readOnly
              />
              <span>{t('paymentPage.invoice.sameAsInvoice')}</span>
            </label>
            <label className="flex w-full cursor-pointer items-center space-x-3 rounded-xl border border-gray-300 p-4">
              <RadioButton
                inputClassName={'p-3 cursor-pointer'}
                {...formik.getFieldProps('billingOption')}
                value={BillingAddressOption.ADD_NEW}
                checked={
                  formik.values.billingOption === BillingAddressOption.ADD_NEW
                }
                readOnly
              />
              <span>{t('paymentPage.invoice.addNew')}</span>
            </label>
          </section>
          <section
            className={cx(
              formik.values.billingOption === BillingAddressOption.ADD_NEW
                ? 'block'
                : 'hidden',
            )}
          >
            <BillingAddressForm
              fieldNames={{
                country: 'billingCountry',
                province: 'billingProvince',
                district: 'billingDistrict',
                subdistrict: 'billingSubdistrict',
                postalCode: 'billingPostalCode',
                address: 'billingAddress',
              }}
            />
          </section>
        </article>
      </section>
    </>
  );
};
