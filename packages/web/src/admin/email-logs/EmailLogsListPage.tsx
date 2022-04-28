import classNames from 'classnames';
import { format } from 'date-fns';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useToasts } from 'react-toast-notifications';
import { AccessControl } from '../../app-state/accessControl';
import { BACKEND_ADMIN_CONTROL } from '../../constants/policies';
import WEB_PATHS from '../../constants/webPaths';
import useTranslation from '../../i18n/useTranslation';
import { AdminLayout } from '../../layouts/admin.layout';
import { IEmailLog } from '../../models/emailLogs';
import PaginationIndicator from '../../shared/PaginationIndicator';
import {
  DataTable,
  DataTableColumn,
  DataTableColumnSize,
  DataTableHeadColumn,
  DataTableHeadRow,
  DataTableRow,
} from '../../ui-kit/DataTable';
import { ChevronLeft, Eye, Mail, Search } from '../../ui-kit/icons';
import InputField from '../../ui-kit/InputField';
import { formatPrice } from '../../utils/number';
import { ResendEmailModal } from './ResendEmailModal';
import { useEmailLogs } from './useEmailLogs';
import { toastMessage } from '../../ui-kit/ToastMessage';

export const EmailLogsListPage = () => {
  const { addToast } = useToasts();
  const { t } = useTranslation();
  const router = useRouter();

  const {
    emailLogs,
    emailLogsFilter,
    onChangeFilter,
    pagination,
    emailRangeCounts,
    onRefresh,
  } = useEmailLogs();

  const [search, setSearch] = useState('');

  const [emailToResend, setEmailToResend] = useState<IEmailLog | null>(null);

  useEffect(() => {
    if (emailLogsFilter.search) {
      setSearch(search);
    }
  }, [emailLogsFilter.search, search]);

  return (
    <AccessControl
      policyNames={[
        BACKEND_ADMIN_CONTROL.ACCESS_ADMIN_PORTAL,
        BACKEND_ADMIN_CONTROL.ACCESS_EMAIL_NOTIFICATIONS,
      ]}
    >
      <AdminLayout>
        <Head>
          <title>{t('headerText')} | Email Logs</title>
        </Head>
        <div className="flex h-full flex-col">
          <div className="mb-4">
            <a
              role="button"
              onClick={() => {
                router.back();
              }}
              className="flex items-center space-x-2 text-caption text-gray-650"
            >
              <ChevronLeft className="h-4" />
              <span>Back</span>
            </a>
          </div>
          <div className="mb-6 flex justify-between">
            <div className="flex items-end space-x-3">
              <h1 className="text-subtitle font-semibold">Email Logs</h1>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onChangeFilter((query) => ({ ...query, search }));
              }}
            >
              <InputField
                iconLeft={<Search className="h-4 text-gray-400" />}
                name="search"
                placeholder="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </form>
          </div>

          <div className="flex self-start overflow-hidden rounded-lg border border-gray-300 text-caption">
            {(
              [
                { label: 'Today', value: undefined },
                { label: 'Last week', value: 'week' },
                { label: 'Last month', value: 'month' },
                { label: 'All sent', value: 'all' },
              ] as const
            ).map((option, index) => {
              const isSelected = emailLogsFilter.range === option.value;
              return (
                <a
                  key={option.label}
                  className={classNames(
                    'flex items-center space-x-1 py-3 px-4',
                    {
                      'bg-brand-primary text-white': isSelected,
                      'border-l border-gray-300': index !== 0,
                    },
                  )}
                  onClick={() =>
                    onChangeFilter((query) => ({
                      ...query,
                      range: option.value,
                    }))
                  }
                >
                  <span className="font-semibold">{option.label}</span>
                  <span
                    className={classNames({
                      'text-gray-500': !isSelected,
                      'text-white': isSelected,
                    })}
                  >
                    {formatPrice(emailRangeCounts[index], 0)}
                  </span>
                </a>
              );
            })}
          </div>

          <div className="mt-6 flex-1">
            {!emailLogs && (
              <div className="flex h-full flex-1 items-center justify-center">
                <div className="loader h-6 w-6 animate-spin rounded-full border-4 border-gray-500" />
              </div>
            )}
            {emailLogs && emailLogs.length === 0 && (
              <div className="flex h-full w-full flex-col items-center justify-center">
                <img className="h-55 w-max" src="/assets/empty-letter.png" />
                <p className="mt-4 text-center text-heading font-semibold">
                  Email log empty
                </p>
              </div>
            )}
            {emailLogs && emailLogs.length > 0 && (
              <DataTable containerClassName="h-full">
                <thead>
                  <DataTableHeadRow>
                    <DataTableHeadColumn orderBy="email">
                      Sent to
                    </DataTableHeadColumn>
                    <DataTableHeadColumn
                      size={DataTableColumnSize.LONG}
                      orderBy="subject"
                    >
                      Topic
                    </DataTableHeadColumn>
                    <DataTableHeadColumn orderBy="category">
                      Category
                    </DataTableHeadColumn>
                    <DataTableHeadColumn orderBy="createdAt">
                      Sent date
                    </DataTableHeadColumn>
                    <DataTableHeadColumn orderBy="awsMessageId">
                      AWS Message ID
                    </DataTableHeadColumn>
                    <DataTableHeadColumn orderBy="organizationName">
                      Organization
                    </DataTableHeadColumn>
                    <DataTableHeadColumn>Action</DataTableHeadColumn>
                  </DataTableHeadRow>
                </thead>
                <tbody className="text-caption">
                  {emailLogs?.map((item) => (
                    <DataTableRow key={item.id}>
                      <DataTableColumn
                        className="truncate"
                        title={item.user.email}
                      >
                        {item.user.email}
                      </DataTableColumn>
                      <DataTableColumn
                        className="truncate"
                        title={item.subject}
                      >
                        {item.subject}
                      </DataTableColumn>
                      <DataTableColumn
                        className="truncate"
                        title={item.category}
                      >
                        {item.category}
                      </DataTableColumn>
                      <DataTableColumn>
                        {format(
                          new Date(item.createdAt),
                          'dd MMM yyyy HH:mm',
                        ).toUpperCase()}
                      </DataTableColumn>
                      <DataTableColumn
                        className="truncate"
                        title={item.awsMessageId}
                      >
                        {item.awsMessageId}
                      </DataTableColumn>
                      <DataTableColumn>
                        {item.organizationName || '-'}
                      </DataTableColumn>
                      <DataTableColumn>
                        <div className="flex items-center space-x-6">
                          <Link
                            href={WEB_PATHS.EMAIL_LOGS_ID.replace(
                              ':id',
                              item.id,
                            )}
                          >
                            <a
                              target="_blank"
                              rel="noreferrer noopener"
                              className="text-gray-650 hover:text-gray-500"
                            >
                              <Eye />
                            </a>
                          </Link>
                          <div className="w-px self-stretch bg-gray-400"></div>
                          <a
                            role="button"
                            className="text-gray-650 hover:text-gray-500"
                            onClick={() => {
                              setEmailToResend(item);
                            }}
                          >
                            <Mail />
                          </a>
                        </div>
                      </DataTableColumn>
                    </DataTableRow>
                  ))}
                </tbody>
              </DataTable>
            )}
          </div>
          {pagination !== undefined &&
            emailLogs !== undefined &&
            emailLogs.length > 0 && (
              <PaginationIndicator
                totalPages={pagination.totalPages}
                defaultPerPage={pagination.perPage}
                resultLength={emailLogs.length}
                totalRecords={pagination.total}
                showPageSizeDropDown={true}
              />
            )}
        </div>
      </AdminLayout>
      <ResendEmailModal
        data={emailToResend}
        toggle={() => {
          setEmailToResend(null);
        }}
        onResend={(data) => {
          onRefresh();
          addToast(
            toastMessage({
              icon: <Mail className="h-5 w-5" />,
              title: (
                <span>
                  The <span className="text-brand-primary">{data.subject}</span>{' '}
                  notification has been successfully sent.
                </span>
              ),
            }),
            { appearance: 'info' },
          );
        }}
      />
    </AccessControl>
  );
};
