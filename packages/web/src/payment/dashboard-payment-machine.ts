import {
  OrderPaymentSummaryDto,
  orderPaymentSummarySchema,
} from './orderPaymentSummary.schema';
import { AnyEventObject, assign, Machine } from 'xstate';
import API_PATHS from '../constants/apiPaths';
import { paymentHttp } from '../http';

export interface DashboardPaymentContext {
  data: OrderPaymentSummaryDto;
  error: string;
}

export const dashboardPaymentMachine = Machine<DashboardPaymentContext>({
  id: 'dashboardPaymentMachine',
  initial: 'idle',
  context: {
    data: null,
    error: null,
  },
  states: {
    idle: {
      on: {
        FETCH: 'loading',
      },
    },
    loading: {
      invoke: {
        id: 'fetchData',
        src: (ctx, evt) => fetchDashboardPayment(ctx, evt),
        onDone: {
          target: 'success',
          actions: assign({
            data: (_context, event) => event.data,
          }),
        },
        onError: {
          target: 'failure',
          actions: assign({
            error: (_context, event) => event.data.message,
          }),
        },
      },
    },
    success: {
      on: {
        FETCH: 'loading',
      },
    },
    failure: {
      on: {
        FETCH: 'loading',
      },
    },
  },
});

async function fetchDashboardPayment(
  context: DashboardPaymentContext,
  evt: AnyEventObject,
) {
  const { fromTimestamp, toTimestamp } = evt;
  const orderSummaryRes = await paymentHttp.get(
    API_PATHS.ORDER_PAYMENT_SUMMARY,
    {
      params: {
        fromDate: fromTimestamp,
        toDate: toTimestamp,
      },
    },
  );

  return orderPaymentSummarySchema.cast(orderSummaryRes.data.data);
}
