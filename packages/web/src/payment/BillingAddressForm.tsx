import { useField } from 'formik';
import { useRouter } from 'next/router';
import { FC, useEffect, useState } from 'react';
import AddressApi from '../http/address.api';
import useTranslation from '../i18n/useTranslation';
import { District } from '../models/district';
import { Province } from '../models/province';
import { Subdistrict } from '../models/subdistrict';
import InputSelect from '../ui-kit/InputSelect';
import { find } from 'lodash';
import InputSection from '../ui-kit/InputSection';

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

  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [subdistricts, setSubdistricts] = useState<Subdistrict[]>([]);
  const [postalCodes, setPostalCodes] = useState<Subdistrict[]>([]);

  async function fetchProvinces(query?: { id?: number }) {
    const provinces: Province[] = await AddressApi.getProvince({
      ...query,
      locale,
    });
    setProvinces(provinces);
  }

  async function fetchDistricts(query?: { id?: number; provinceId?: number }) {
    const districts: District[] = await AddressApi.getDistricts({
      ...query,
      locale,
    });
    setDistricts(districts);
  }

  async function fetchSubdistricts(query?: {
    id?: number;
    provinceId?: number;
    districtId?: number;
  }) {
    const subdistricts: Subdistrict[] = await AddressApi.getSubdistricts({
      ...query,
      locale,
    });
    setSubdistricts(subdistricts);
  }

  async function handleProvinceChange(
    evt: React.ChangeEvent<{ name: string; value: Province }>,
  ) {
    const { value: province } = evt.target;
    const provinceHelper = fieldProvince[2];
    const districtHelper = fieldDistrict[2];
    const subdistrictHelper = fieldSubdistrict[2];

    provinceHelper.setValue(province);
    districtHelper.setValue(null);
    subdistrictHelper.setValue(null);
    setProvinces(provinces);
    setDistricts([]);
    setSubdistricts([]);
    setPostalCodes([]);
    await fetchDistricts({ provinceId: province.id });
  }

  async function handleDistrictChange(
    evt: React.ChangeEvent<{ name: string; value: District }>,
  ) {
    const { value: district } = evt.target;
    const [fieldInputProvince] = fieldProvince;
    const districtHelper = fieldDistrict[2];
    const subdistrictHelper = fieldSubdistrict[2];

    districtHelper.setValue(district);
    subdistrictHelper.setValue(null);
    setSubdistricts([]);
    setPostalCodes([]);
    await fetchSubdistricts({
      provinceId: fieldInputProvince.value.id,
      districtId: district.id,
    });
  }

  async function handleSubdistrictChange(
    evt: React.ChangeEvent<{ name: string; value: Subdistrict }>,
  ) {
    const { value: subdistrict } = evt.target;
    const subdistrictHelper = fieldSubdistrict[2];
    const postalHelper = fieldPostalCode[2];

    subdistrictHelper.setValue(subdistrict);
    setPostalCodes([subdistrict]); // we can pinpoint the exact postal code because we already have provinceId, districtId, and subdistrictId
    postalHelper.setValue(subdistrict);
  }

  async function handlePostalCodeChange(
    evt: React.ChangeEvent<{ name: string; value: Subdistrict }>,
  ) {
    const { value: postalCode } = evt.target;
    const postalCodeHelper = fieldPostalCode[2];

    postalCodeHelper.setValue(postalCode);
  }

  return {
    fieldCountry,
    fieldProvince,
    fieldDistrict,
    fieldSubdistrict,
    fieldPostalCode,
    countries: [t('address.thailand')],
    provinces,
    districts,
    subdistricts,
    postalCodes,
    fetchProvinces,
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
    fieldProvince: [fieldInputProvince, fieldMetaProvince, fieldHelperProvince],
    fieldDistrict: [fieldInputDistrict, fieldMetaDistrict],
    fieldSubdistrict: [fieldInputSubdistrict, fieldMetaSubdistrict],
    fieldPostalCode: [fieldInputPostalCode, fieldMetaPostalCode],
    countries,
    provinces,
    districts,
    subdistricts,
    postalCodes,
    fetchProvinces,
    handleProvinceChange,
    handleDistrictChange,
    handleSubdistrictChange,
    handlePostalCodeChange,
  } = useAddressPointForm(fieldNames);
  const { t } = useTranslation();
  const { locale } = useRouter();

  useEffect(() => {
    fieldHelperProvince.setValue(null);
    fetchProvinces();
  }, []);

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
            }) || fieldInputProvince.value
              ? {
                  label:
                    locale === 'en'
                      ? fieldInputProvince.value.provinceNameEn
                      : fieldInputProvince.value.provinceNameTh,
                  value: fieldInputProvince.value.id,
                }
              : null
          }
          label={t('address.province')}
          options={[]}
          renderOptions={provinceOptions}
          onChange={handleProvinceChange}
          error={fieldMetaProvince.touched && fieldMetaProvince.error}
        />
        <InputSelect
          {...fieldInputDistrict}
          value={
            find(districtOptions, {
              value: { id: fieldInputDistrict.value?.id },
            }) || fieldInputDistrict.value
              ? {
                  label:
                    locale === 'en'
                      ? fieldInputDistrict.value.districtNameEn
                      : fieldInputDistrict.value.districtNameTh,
                  value: fieldInputDistrict.value.id,
                }
              : null
          }
          label={t('address.district')}
          options={[]}
          renderOptions={districtOptions}
          isDisabled={districts.length <= 0 && !fieldInputDistrict.value}
          onChange={handleDistrictChange}
          error={fieldMetaDistrict.touched && fieldMetaDistrict.error}
        />
      </div>
      <div className="space-y-6 lg:flex lg:space-x-6 lg:space-y-0">
        <InputSelect
          {...fieldInputSubdistrict}
          value={
            find(subdistrictOptions, {
              value: { id: fieldInputSubdistrict.value?.id },
            }) || fieldInputSubdistrict.value
              ? {
                  label:
                    locale === 'en'
                      ? fieldInputSubdistrict.value.subdistrictNameEn
                      : fieldInputSubdistrict.value.subdistrictNameTh,
                  value: fieldInputSubdistrict.value.id,
                }
              : null
          }
          label={t('address.subdistrict')}
          options={[]}
          renderOptions={subdistrictOptions}
          isDisabled={
            subdistrictOptions.length <= 0 && !fieldInputSubdistrict.value
          }
          onChange={handleSubdistrictChange}
          error={fieldMetaSubdistrict.touched && fieldMetaSubdistrict.error}
        />
        <InputSelect
          {...fieldInputPostalCode}
          value={
            find(postalCodeOptions, {
              value: { id: fieldInputSubdistrict.value?.id },
            }) || fieldInputSubdistrict.value
              ? {
                  label: fieldInputSubdistrict.value.zipCode,
                  value: fieldInputSubdistrict.value.id,
                }
              : null
          }
          label={t('address.postalCode')}
          options={[]}
          renderOptions={postalCodeOptions}
          isDisabled={
            postalCodeOptions.length <= 0 && !fieldInputSubdistrict.value
          }
          onChange={handlePostalCodeChange}
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
