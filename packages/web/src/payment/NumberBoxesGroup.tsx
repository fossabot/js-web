import NumberBox from './NumberBox';

function NumberStat({ orderSummary }) {
  return (
    <div className="flex w-full flex-col flex-wrap gap-y-3 sm:flex-row">
      <div className="sm:w-1/2 sm:pr-1.5 lg:w-1/5">
        <NumberBox title="New User" value={orderSummary.newUser} />
      </div>
      <div className="sm:w-1/2 sm:pl-1.5 lg:w-1/5 lg:pl-0 lg:pr-1.5">
        <NumberBox title="Renew User" value={orderSummary.renewUser} />
      </div>
      <div className="sm:w-1/2 sm:pr-1.5 lg:w-1/5">
        <NumberBox title="Expired User" value={orderSummary.expiredUser} />
      </div>
      <div className="sm:w-1/2 sm:pl-1.5 lg:w-1/5 lg:pl-0 lg:pr-1.5">
        <NumberBox
          title="Unsuccessful Payment"
          value={orderSummary.unsuccessfulPayment}
          prefix="฿"
        />
      </div>
      <div className="sm:w-1/2 sm:pr-1.5 lg:w-1/5">
        <NumberBox title="Revenue" value={orderSummary.revenue} prefix="฿" />
      </div>
    </div>
  );
}

export default NumberStat;
