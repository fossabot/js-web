import { FormikProps } from 'formik';
import { FC } from 'react';
import useTranslation from '../i18n/useTranslation';
import { OfficeType, TaxType } from '../models/baseTaxInvoice';
import { AddressFormSchema, BillingAddressOption } from './AddressForm.schema';
import InputSection from '../ui-kit/InputSection';
import RadioButton from '../ui-kit/RadioButton';
import cx from 'classnames';
import { BillingAddressForm } from './BillingAddressForm';

export interface IAddressForm {
  formik: FormikProps<AddressFormSchema>;
}

export const AddressForm: FC<IAddressForm> = (props) => {
  const { formik } = props;
  const { t } = useTranslation();

  return (
    <section>
      <header className="text-caption font-semibold">
        {t('addressEditPage.invoice.invoiceFor')}
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
            {t('addressEditPage.invoice.individual')}
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
            {t('addressEditPage.invoice.organization')}
          </span>
        </label>
      </section>
      <label>
        <header className="mt-8 text-caption font-semibold">
          {t('addressEditPage.invoice.taxEntityName')}
        </header>
        <section className="mt-2">
          <InputSection
            name="taxEntityName"
            placeholder={t('addressEditPage.invoice.taxEntityNamePlaceholder')}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.taxEntityName}
            error={formik.touched.taxEntityName && formik.errors.taxEntityName}
          />
        </section>
      </label>
      <header className="mt-8 text-caption font-semibold">
        {t('addressEditPage.invoice.officeType')}
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
            {t('addressEditPage.invoice.headOffice')}
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
            {t('addressEditPage.invoice.branch')}
          </span>
        </label>
        <section
          className={cx(
            formik.values.officeType === OfficeType.BRANCH ? 'block' : 'hidden',
          )}
        >
          <InputSection
            name="branch"
            placeholder={t('addressEditPage.invoice.branchPlaceholder')}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.branch}
            error={formik.touched.branch && formik.errors.branch}
          />
        </section>
      </section>
      <hr className="my-8 border-gray-200" />
      <header className="text-subheading font-bold">
        {t('addressEditPage.invoice.taxInvoiceInformation')}
      </header>
      <article>
        <label>
          <header className="mt-8 text-caption font-semibold">
            {t('addressEditPage.invoice.taxId')}
          </header>
          <section className="mt-2">
            <InputSection
              name="taxId"
              placeholder={t('addressEditPage.invoice.taxIdPlaceholder')}
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
          {t('addressEditPage.invoice.contactInformation')}
        </header>
        <section className="mt-8">
          <label className="space-y-2">
            <div className="text-caption font-semibold">
              {t('addressEditPage.invoice.contactName')}
            </div>
            <InputSection
              name="taxContactPerson"
              placeholder={t('addressEditPage.invoice.contactNamePlaceholder')}
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
                {t('addressEditPage.invoice.emailAddress')}
              </div>
              <InputSection
                name="taxContactEmail"
                placeholder={t(
                  'addressEditPage.invoice.emailAddressPlaceholder',
                )}
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
                {t('addressEditPage.invoice.phoneNumber')}
              </div>
              <InputSection
                type="phone"
                name="taxContactPhoneNumber"
                placeholder={t(
                  'addressEditPage.invoice.phoneNumberPlaceholder',
                )}
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
        {t('addressEditPage.invoice.billingAddress')}
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
            <span>{t('addressEditPage.invoice.sameAsInvoice')}</span>
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
            <span>{t('addressEditPage.invoice.addNew')}</span>
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
  );
};
