import ListBox from './ListBox';

function ListStatBoxes({ orderSummary }) {
  return (
    <div className="mt-5 flex flex-col gap-y-3 sm:flex-row">
      <div className="box-border pr-1.5 sm:w-1/2">
        <ListBox title="Package Type" list={orderSummary.packageType} />
      </div>
      <div className="box-border pl-1.5 sm:w-1/2">
        <ListBox title="Member Type" list={orderSummary.memberType} />
      </div>
    </div>
  );
}

export default ListStatBoxes;
