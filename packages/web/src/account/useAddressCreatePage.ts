import API_PATHS from '../constants/apiPaths';
import { centralHttp } from '../http';
import { AddressFormSchema, BillingAddressOption } from './AddressForm.schema';
import { useSuccessMessage } from '../utils/useSuccessMessage';
import { getErrorMessages } from '../utils/error';
import { useErrorMessage } from '../utils/useErrorMessage';
import { OfficeType } from '../models/baseTaxInvoice';
import { useRouter } from 'next/router';
import WEB_PATHS from '../constants/webPaths';

export function useAddressCreatePage() {
  const router = useRouter();
  const saveSuccessMessage = useSuccessMessage();
  const saveErrorMessage = useErrorMessage();

  async function saveChanges(values: AddressFormSchema) {
    const payload = {
      isDefault: false,
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
    saveChanges,
    saveSuccessMessage,
    saveErrorMessage,
    onCancel,
  };
}
