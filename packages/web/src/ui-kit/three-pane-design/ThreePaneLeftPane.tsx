import cx from 'classnames';
import { ReactNode } from 'react';
import Pagination from '../Pagination';

export interface IThreePaneLeftPane<
  T extends { id: string },
  F extends { id: string },
> {
  onClickAdd?: () => void;
  addButtonLabel?: string;
  emptyLabel: string;
  data: T[];
  current: F;
  render: (datum: T) => ReactNode;
  fetchDetail: (param: T['id']) => void;
  totalPages: number;
}

const ThreePaneLeftPane = <T extends { id: string }, F extends { id: string }>({
  onClickAdd,
  data,
  current,
  render,
  fetchDetail,
  addButtonLabel,
  emptyLabel,
  totalPages,
}: IThreePaneLeftPane<T, F>) => {
  return (
    <div className="flex w-2/6 flex-col px-2 py-2">
      <div className="flex-1 space-y-2 rounded bg-white p-6 shadow-lg">
        {onClickAdd && addButtonLabel && (
          <button
            onClick={() => onClickAdd()}
            className="outline-none focus:outline-none mb-3 w-full cursor-pointer rounded bg-brand-primary py-2 px-4 font-bold text-white focus:ring"
          >
            {addButtonLabel}
          </button>
        )}
        {data.length ? (
          data.map((datum) => (
            <div
              className={cx('text-md cursor-pointer font-bold', {
                'text-gray-500': current ? current.id !== datum.id : true,
              })}
              key={datum.id}
              onClick={() => fetchDetail(datum.id)}
            >
              {render(datum)}
            </div>
          ))
        ) : (
          <span className="text-lg font-bold">{emptyLabel}</span>
        )}
      </div>
      <Pagination totalPages={totalPages} className="mt-4 space-y-3" />
    </div>
  );
};

export default ThreePaneLeftPane;
