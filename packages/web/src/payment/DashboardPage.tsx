import { useMachine } from '@xstate/react';
import {
  addDays,
  format,
  fromUnixTime,
  getUnixTime,
  startOfDay,
} from 'date-fns';
import fileDownload from 'js-file-download';
import Head from 'next/head';
import { useEffect } from 'react';
import API_PATHS from '../constants/apiPaths';
import { paymentHttp } from '../http';
import useTranslation from '../i18n/useTranslation';
import { AdminLayout } from '../layouts/admin.layout';
import { DatePicker } from '../ui-kit/lib/Datepicker';
import { dashboardPaymentMachine } from './dashboard-payment-machine';
import ListBoxesGroup from './ListBoxesGroup';
import NumberBoxesGroup from './NumberBoxesGroup';

const DashboardPage = () => {
  const { t } = useTranslation();
  const [current, send] = useMachine(dashboardPaymentMachine);

  useEffect(() => {
    handleChangePeriod(
      getUnixTime(startOfDay(addDays(new Date(), -7))),
      getUnixTime(new Date()),
    );
  }, []);

  function handleChangePeriod(fromTimestamp: number, toTimestamp: number) {
    send('FETCH', { fromTimestamp, toTimestamp });
  }

  const { data: orderSummary } = current.context;

  return (
    <AdminLayout>
      <Head>
        <title>{t('headerText')} | Dashboard</title>
      </Head>
      <h2 className="mb-4 text-3xl">Payment Dashboard</h2>
      {current.matches('failure') && <div>{current.context.error}</div>}
      {current.matches('success') && (
        <div id="dashboard-payment">
          <div className="flex items-stretch">
            <div className="mr-5">
              <div className="mr-5">From</div>
              <DatePicker
                date={fromUnixTime(orderSummary.period.fromTimestamp)}
                onChange={(date) =>
                  handleChangePeriod(
                    getUnixTime(date),
                    orderSummary.period.toTimestamp,
                  )
                }
              />
            </div>
            <div className="mr-5">
              <div className="mr-5">To</div>
              <DatePicker
                date={fromUnixTime(orderSummary.period.toTimestamp)}
                onChange={(date) =>
                  handleChangePeriod(
                    orderSummary.period.fromTimestamp,
                    getUnixTime(date),
                  )
                }
              />
            </div>
            <div className="mr-5">
              <button
                className="outline-none focus:outline-none mb-5 mt-5 cursor-pointer rounded bg-white py-2.5 px-4 font-bold text-black shadow shadow-sm transition-all hover:bg-gray-700 hover:text-white focus:ring"
                onClick={() =>
                  downloadPaymentReport(
                    API_PATHS.ORDER_PAYMENT_SUMMARY_CSV,
                    orderSummary.period,
                  )
                }
              >
                Download CSV
              </button>
            </div>
          </div>

          <NumberBoxesGroup orderSummary={orderSummary} />
          <ListBoxesGroup orderSummary={orderSummary} />
        </div>
      )}
    </AdminLayout>
  );
};

async function downloadPaymentReport(
  endpoint: string,
  period: Partial<{ fromTimestamp: number; toTimestamp: number }>,
) {
  const { fromTimestamp, toTimestamp } = period;
  const fromDate = fromUnixTime(fromTimestamp);
  const toDate = fromUnixTime(toTimestamp);
  const filename = `report-from-${format(fromDate, 'dd-MM-yyyy')}-to-${format(
    toDate,
    'dd-MM-yyyy',
  )}.csv`;
  const res = await paymentHttp.get(endpoint, {
    responseType: 'blob',
    params: period,
  });
  fileDownload(res.data, filename);
}

export default DashboardPage;
