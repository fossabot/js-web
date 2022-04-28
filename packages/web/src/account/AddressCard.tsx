import classNames from 'classnames';
import { useRouter } from 'next/router';
import { Dispatch, FC, useState } from 'react';
import WEB_PATHS from '../constants/webPaths';
import useTranslation from '../i18n/useTranslation';
import { TaxType } from '../models/baseTaxInvoice';
import { UserTaxInvoice } from '../models/userTaxInvoice';
import Button from '../ui-kit/Button';
import { Company, Pencil, Person, Trash } from '../ui-kit/icons';

export interface IAddressCard {
  userTaxInvoice: UserTaxInvoice;
  className?: string;
  onRemove: Dispatch<UserTaxInvoice>;
}

export const AddressCard: FC<IAddressCard> = (props) => {
  const { userTaxInvoice, className, onRemove } = props;
  const fullAddress = [
    userTaxInvoice.taxAddress,
    userTaxInvoice.subdistrict.subdistrictNameEn,
    userTaxInvoice.district.districtNameEn,
    userTaxInvoice.province.provinceNameEn,
    userTaxInvoice.zipCode,
  ].join(', ');
  const { t } = useTranslation();
  const router = useRouter();
  const [isRemoving, setIsRemoving] = useState<boolean>(false);

  function handleOnClickRemove() {
    setIsRemoving(true);
    onRemove(userTaxInvoice);
    setIsRemoving(false);
  }

  return (
    <article className={classNames('rounded-lg bg-gray-100 p-6', className)}>
      <div className="flex items-center space-x-3">
        {userTaxInvoice.taxType === TaxType.INDIVIDUAL && <Person />}
        {userTaxInvoice.taxType === TaxType.ORGANIZATION && <Company />}
        <div className="text-body font-semibold">
          {userTaxInvoice.taxEntityName}
        </div>
      </div>
      <div className="pt-2 text-caption text-gray-650">{fullAddress}</div>
      <div className="pt-2 text-caption text-gray-500">
        {t('addressListPage.taxId')}: {userTaxInvoice.taxId}
      </div>
      <div className="flex items-center justify-between pt-4">
        <div>
          <Button
            className="space-x-1 font-semibold"
            variant="secondary"
            size="medium"
            onClick={() =>
              router.push(
                WEB_PATHS.MANAGE_ADDRESS_ID.replace(':id', userTaxInvoice.id),
              )
            }
          >
            <Pencil />
            <div>{t('addressListPage.edit')}</div>
          </Button>
        </div>
        <div>
          <Button
            variant="ghost"
            className="bg-maroon-200 p-3"
            onClick={handleOnClickRemove}
            isLoading={isRemoving}
            disabled={userTaxInvoice.isDefault}
          >
            <Trash />
          </Button>
        </div>
      </div>
    </article>
  );
};
