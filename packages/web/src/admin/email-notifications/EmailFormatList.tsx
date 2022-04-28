import { Dispatch, FC } from 'react';
import useTranslation from '../../i18n/useTranslation';
import { EmailFormat } from '../../models/emailFormat';
import {
  DataTable,
  DataTableAlignment,
  DataTableColumn,
  DataTableHeadColumn,
  DataTableHeadRow,
  DataTableRow,
} from '../../ui-kit/DataTable';
import { Check, PencilThick, TrashFilled } from '../../ui-kit/icons';
import cx from 'classnames';

export interface IEmailFormatList {
  emailFormats: EmailFormat[];
  onEdit: Dispatch<EmailFormat>;
  onRemove: Dispatch<EmailFormat>;
}

export const EmailFormatList: FC<IEmailFormatList> = (props) => {
  const { t } = useTranslation();
  const { emailFormats, onEdit, onRemove } = props;

  return (
    <>
      <DataTable>
        <thead>
          <DataTableHeadRow>
            <DataTableHeadColumn orderBy="formatName" className="w-9/12">
              {t('emailFormatListPage.title')}
            </DataTableHeadColumn>
            <DataTableHeadColumn
              className="w-1/12"
              align={DataTableAlignment.CENTER}
            >
              {t('emailFormatListPage.default')}
            </DataTableHeadColumn>
            <DataTableHeadColumn
              className="w-2/12"
              align={DataTableAlignment.CENTER}
            >
              {t('emailFormatListPage.action')}
            </DataTableHeadColumn>
          </DataTableHeadRow>
        </thead>
        <tbody>
          {emailFormats.map((item) => (
            <DataTableRow key={item.id}>
              <DataTableColumn>{item.formatName}</DataTableColumn>
              <DataTableColumn>
                {item.isDefault && (
                  <Check className="mx-auto h-5 w-5 text-brand-primary" />
                )}
              </DataTableColumn>
              <DataTableColumn className="flex justify-center space-x-6">
                <div
                  className="flex cursor-pointer items-center space-x-3"
                  onClick={() => onEdit(item)}
                >
                  <span className="font-semibold text-gray-650">
                    {t('emailFormatListPage.edit')}
                  </span>
                  <PencilThick className="h-5 w-5" />
                </div>
                <div className="border-l border-gray-400" />
                <div
                  className={cx('flex cursor-pointer space-x-4', {
                    invisible: item.isDefault,
                  })}
                  onClick={() => onRemove(item)}
                >
                  <span className="font-semibold text-gray-650">
                    {t('emailFormatListPage.remove')}
                  </span>
                  <TrashFilled className="h-5 w-5" />
                </div>
              </DataTableColumn>
            </DataTableRow>
          ))}
        </tbody>
      </DataTable>
    </>
  );
};
