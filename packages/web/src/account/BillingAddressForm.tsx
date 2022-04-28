import { useField } from 'formik';
import { useRouter } from 'next/router';
import { FC, useEffect } from 'react';
import AddressApi from '../http/address.api';
import useTranslation from '../i18n/useTranslation';
import { District } from '../models/district';
import { Province } from '../models/province';
import { Subdistrict } from '../models/subdistrict';
import InputSelect from '../ui-kit/InputSelect';
import { find } from 'lodash';
import InputSection from '../ui-kit/InputSection';
import useSWR from 'swr';
import API_PATHS from '../constants/apiPaths';
import { every, isUndefined } from 'lodash';

export interface IBillingAddressFormFieldNames {
  country: string;
  province: string;
  district: string;
  subdistrict: string;
  postalCode: string;
  address: string;
}

export function useAddressPointForm(fieldNames: IBillingAddressFormFieldNames) {
  const fieldCountry = useField<string>(fieldNames.country);
  const fieldProvince = useField<Province | null>(fieldNames.province);
  const fieldDistrict = useField<District | null>(fieldNames.district);
  const fieldSubdistrict = useField<Subdistrict | null>(fieldNames.subdistrict);
  const fieldPostalCode = useField<Subdistrict | null>(fieldNames.postalCode);
  const { t } = useTranslation();
  const { locale } = useRouter();
  const { data: provinces } = useSWR(API_PATHS.GET_PROVINCE, () =>
    AddressApi.getProvince({ locale }),
  );
  const { data: districts } = useSWR(
    () =>
      !isUndefined(fieldProvince[0].value)
        ? [API_PATHS.GET_DISTRICT, fieldProvince[0].value.id]
        : null,
    (url: string, provinceId: string) =>
      AddressApi.getDistricts({ locale, provinceId }),
  );
  const { data: subdistricts } = useSWR(
    () =>
      every(
        [fieldProvince[0], fieldDistrict[0]],
        ({ value }) => !isUndefined(value),
      )
        ? [
            API_PATHS.GET_SUBDISTRICT,
            fieldProvince[0].value.id,
            fieldDistrict[0].value.id,
          ]
        : null,
    (url, provinceId: string, districtId: string) =>
      AddressApi.getSubdistricts({
        locale,
        provinceId,
        districtId,
      }),
  );
  const { data: postalCodes } = useSWR(
    () =>
      every(
        [fieldProvince[0], fieldDistrict[0], fieldSubdistrict[0]],
        ({ value }) => !isUndefined(value),
      )
        ? [
            API_PATHS.GET_ZIPCODE,
            fieldProvince[0].value.id,
            fieldDistrict[0].value.id,
            fieldSubdistrict[0].value.id,
          ]
        : null,
    (url, provinceId: string, districtId: string, subdistrictId: string) =>
      AddressApi.getZipCode({
        locale,
        provinceId,
        districtId,
        id: subdistrictId,
      }),
  );

  async function handleProvinceChange(province: Province) {
    const provinceHelper = fieldProvince[2];
    const districtHelper = fieldDistrict[2];
    const subdistrictHelper = fieldSubdistrict[2];
    const postalCodeHelper = fieldPostalCode[2];

    provinceHelper.setValue(province);
    districtHelper.setValue(null);
    subdistrictHelper.setValue(null);
    postalCodeHelper.setValue(null);
  }

  async function handleDistrictChange(district: District) {
    const districtHelper = fieldDistrict[2];
    const subdistrictHelper = fieldSubdistrict[2];
    const postalCodeHelper = fieldPostalCode[2];

    districtHelper.setValue(district);
    subdistrictHelper.setValue(null);
    postalCodeHelper.setValue(null);
  }

  async function handleSubdistrictChange(subdistrict: Subdistrict) {
    const subdistrictHelper = fieldSubdistrict[2];
    const postalHelper = fieldPostalCode[2];

    subdistrictHelper.setValue(subdistrict);
    postalHelper.setValue(subdistrict);
  }

  async function handlePostalCodeChange(subdistrict: Subdistrict) {
    const postalCodeHelper = fieldPostalCode[2];

    postalCodeHelper.setValue(subdistrict);
  }

  return {
    fieldCountry,
    fieldProvince,
    fieldDistrict,
    fieldSubdistrict,
    fieldPostalCode,
    countries: [t('address.thailand')],
    provinces: provinces || [],
    districts: districts || [],
    subdistricts: subdistricts || [],
    postalCodes: postalCodes || [],
    handleProvinceChange,
    handleDistrictChange,
    handleSubdistrictChange,
    handlePostalCodeChange,
  };
}

export interface IBillingAddressForm {
  fieldNames: IBillingAddressFormFieldNames;
}

export const BillingAddressForm: FC<IBillingAddressForm> = (props) => {
  const { fieldNames } = props;
  const { address } = fieldNames;
  const [fieldAddress, fieldMetaAddress] = useField<string>(address);
  const {
    fieldCountry: [fieldInputCountry, fieldMetaCountry],
    fieldProvince: [fieldInputProvince, fieldMetaProvince],
    fieldDistrict: [fieldInputDistrict, fieldMetaDistrict],
    fieldSubdistrict: [fieldInputSubdistrict, fieldMetaSubdistrict],
    fieldPostalCode: [fieldInputPostalCode, fieldMetaPostalCode],
    countries,
    provinces,
    districts,
    subdistricts,
    postalCodes,
    handleProvinceChange,
    handleDistrictChange,
    handleSubdistrictChange,
    handlePostalCodeChange,
  } = useAddressPointForm(fieldNames);
  const { t } = useTranslation();
  const { locale } = useRouter();

  useEffect(() => {
    if (fieldInputPostalCode.value) {
      handlePostalCodeChange(fieldInputSubdistrict.value);
    }
  }, [fieldInputPostalCode.value]);

  const provinceOptions = provinces.map((province) => ({
    label: locale === 'en' ? province.provinceNameEn : province.provinceNameTh,
    value: { ...province },
  }));
  const districtOptions = districts.map((district) => ({
    label: locale === 'en' ? district.districtNameEn : district.districtNameTh,
    value: { ...district },
  }));
  const subdistrictOptions = subdistricts.map((subdistrict) => ({
    label:
      locale === 'en'
        ? subdistrict.subdistrictNameEn
        : subdistrict.subdistrictNameTh,
    value: { ...subdistrict },
  }));
  const postalCodeOptions = postalCodes.map((subdistrict) => ({
    label: subdistrict.zipCode,
    value: { ...subdistrict },
  }));

  return (
    <section className="space-y-6">
      <InputSelect
        {...fieldInputCountry}
        value={undefined}
        label={t('address.country')}
        options={countries}
        defaultValue={{
          label: fieldInputCountry.value,
          value: fieldInputCountry.value,
        }}
        error={fieldMetaCountry.touched && fieldMetaCountry.error}
      />
      <div className="space-y-6 lg:flex lg:space-x-6 lg:space-y-0">
        <InputSelect
          {...fieldInputProvince}
          value={
            find(provinceOptions, {
              value: { id: fieldInputProvince.value?.id },
            }) || null
          }
          label={t('address.province')}
          options={[]}
          renderOptions={provinceOptions}
          onChange={(evt) => handleProvinceChange(evt.target.value)}
          error={fieldMetaProvince.touched && fieldMetaProvince.error}
        />
        <InputSelect
          {...fieldInputDistrict}
          value={
            find(districtOptions, {
              value: { id: fieldInputDistrict.value?.id },
            }) || null
          }
          label={t('address.district')}
          options={[]}
          renderOptions={districtOptions}
          isDisabled={districts.length <= 0}
          onChange={(evt) => handleDistrictChange(evt.target.value)}
          error={fieldMetaDistrict.touched && fieldMetaDistrict.error}
        />
      </div>
      <div className="space-y-6 lg:flex lg:space-x-6 lg:space-y-0">
        <InputSelect
          {...fieldInputSubdistrict}
          value={
            find(subdistrictOptions, {
              value: { id: fieldInputSubdistrict.value?.id },
            }) || null
          }
          label={t('address.subdistrict')}
          options={[]}
          renderOptions={subdistrictOptions}
          isDisabled={subdistrictOptions.length <= 0}
          onChange={(evt) => handleSubdistrictChange(evt.target.value)}
          error={fieldMetaSubdistrict.touched && fieldMetaSubdistrict.error}
        />
        <InputSelect
          {...fieldInputPostalCode}
          value={
            find(postalCodeOptions, {
              value: { id: fieldInputSubdistrict.value?.id },
            }) || null
          }
          label={t('address.postalCode')}
          options={[]}
          renderOptions={postalCodeOptions}
          isDisabled={postalCodeOptions.length <= 0}
          onChange={(evt) => handlePostalCodeChange(evt.target.value)}
          error={fieldMetaPostalCode.touched && fieldMetaPostalCode.error}
        />
      </div>
      <label htmlFor={fieldAddress.name} className="block">
        <span className="mb-2 block text-caption font-semibold">
          {t('address.address')}
        </span>
        <InputSection
          {...fieldAddress}
          error={fieldMetaAddress.touched && fieldMetaAddress.error}
        />
      </label>
    </section>
  );
};
