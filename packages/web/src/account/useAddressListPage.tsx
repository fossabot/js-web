import { useState } from 'react';
import API_PATHS from '../constants/apiPaths';
import { centralHttp } from '../http';
import { BaseResponseDto } from '../models/BaseResponse.dto';
import { UserTaxInvoice } from '../models/userTaxInvoice';
import { useModal } from '../ui-kit/Modal';

export function useAddressListPage() {
  const [addressToRemove, setAddressToRemove] = useState<UserTaxInvoice>(null);
  const [myTaxInvoices, setMyTaxInvoices] = useState<UserTaxInvoice[]>([]);
  const confirmRemoveAddressModalProps = useModal();

  async function listMyTaxInvoices() {
    const { data } = await centralHttp.get<BaseResponseDto<UserTaxInvoice[]>>(
      API_PATHS.USER_TAX_INVOICE,
    );
    setMyTaxInvoices(data.data);
  }

  async function removeMyTaxInvoice(myTaxInvoice: UserTaxInvoice) {
    await centralHttp.delete(
      API_PATHS.USER_TAX_INVOICE_ID.replace(':id', myTaxInvoice.id),
    );
    await listMyTaxInvoices();
  }

  function handleRemoveAddress(myTaxInvoice: UserTaxInvoice) {
    setAddressToRemove(myTaxInvoice);
    confirmRemoveAddressModalProps.toggle();
  }

  async function handleConfirmRemoveAddress() {
    confirmRemoveAddressModalProps.toggle();
    await removeMyTaxInvoice(addressToRemove);
    setAddressToRemove(null);
  }

  return {
    handleRemoveAddress,
    handleConfirmRemoveAddress,
    removeMyTaxInvoice,
    confirmRemoveAddressModalProps,
    listMyTaxInvoices,
    myTaxInvoices,
  };
}
