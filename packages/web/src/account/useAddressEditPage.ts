import API_PATHS from '../constants/apiPaths';
import { centralHttp } from '../http';
import { BaseResponseDto } from '../models/BaseResponse.dto';
import { UserTaxInvoice } from '../models/userTaxInvoice';
import useSWR from 'swr';
import { useRouter } from 'next/router';
import { AddressFormSchema, BillingAddressOption } from './AddressForm.schema';
import { useSuccessMessage } from '../utils/useSuccessMessage';
import { getErrorMessages } from '../utils/error';
import { useErrorMessage } from '../utils/useErrorMessage';
import { OfficeType } from '../models/baseTaxInvoice';
import WEB_PATHS from '../constants/webPaths';

export function useAddressEditPage() {
  const router = useRouter();
  const saveSuccessMessage = useSuccessMessage();
  const saveErrorMessage = useErrorMessage();
  const userTaxInvoiceId = router.query.id as string;
  const { data, error } = useSWR(
    API_PATHS.USER_TAX_INVOICE_ID.replace(':id', userTaxInvoiceId),
    (url) =>
      centralHttp
        .get<BaseResponseDto<UserTaxInvoice>>(url)
        .then((res) => res.data),
  );
  const myTaxInvoice = data?.data;

  if (error) {
    saveErrorMessage.setMessage(getErrorMessages(error));
  }

  async function saveChanges(values: AddressFormSchema) {
    const payload = {
      id: myTaxInvoice.id,
      isDefault: myTaxInvoice.isDefault,
      taxType: values.taxType,
      officeType: values.officeType,
      taxEntityName: values.taxEntityName,
      headOfficeOrBranch:
        values.officeType === OfficeType.BRANCH ? values.branch : undefined,
      taxId: values.taxId,
      taxAddress: values.taxAddress,
      districtId: values.taxDistrict.id,
      subdistrictId: values.taxSubdistrict.id,
      provinceId: values.taxProvince.id,
      country: values.taxCountry,
      zipCode: values.taxPostalCode.zipCode,
      contactPerson: values.taxContactPerson,
      contactPhoneNumber: values.taxContactPhoneNumber,
      contactEmail: values.taxContactEmail,

      ...(values.billingOption === BillingAddressOption.ADD_NEW && {
        billingAddress: {
          id: myTaxInvoice.billingAddress?.id,
          country: values.billingCountry,
          provinceId: values.billingProvince.id,
          districtId: values.billingDistrict.id,
          subdistrictId: values.billingSubdistrict.id,
          billingAddress: values.billingAddress,
        },
      }),
    };

    try {
      await centralHttp.post(API_PATHS.USER_TAX_INVOICE, payload);
      await router.push(WEB_PATHS.MANAGE_ADDRESS);
    } catch (error) {
      const errors = getErrorMessages(error);
      saveErrorMessage.setMessage(errors);
      window.scrollTo(0, 0);
    }
  }

  async function onCancel() {
    await router.push(WEB_PATHS.MANAGE_ADDRESS);
  }

  return {
    myTaxInvoice: data?.data,
    isLoading: !error && !data,
    saveChanges,
    saveSuccessMessage,
    saveErrorMessage,
    onCancel,
  };
}
