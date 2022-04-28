import { FC } from 'react';
import SessionItemSkeleton from './SessionItemSkeleton';

interface ISessionCardSkeleton {
  cards?: number;
  hideTopBar?: boolean;
}

const SessionCardSkeleton: FC<ISessionCardSkeleton> = ({
  cards = 3,
  hideTopBar = false,
}) => (
  <>
    {!hideTopBar && (
      <div className="my-5 mx-6 h-6 w-2/3 animate-pulse rounded-lg bg-gray-200 lg:my-0 lg:mx-0 lg:w-1/2" />
    )}
    <div className="flex flex-col space-y-4 bg-gray-100 p-6 lg:space-y-6 lg:rounded-3xl lg:border lg:border-gray-200">
      <div className="flex animate-pulse flex-row items-start space-x-2 lg:items-center">
        <div className="h-5 w-5 flex-shrink-0 rounded-full bg-gray-200" />
        <div className="flex flex-shrink-0 flex-col space-y-3">
          <div className="h-4 w-26 rounded-lg bg-gray-200" />
          <div className="h-4 w-22 rounded-lg bg-gray-200 lg:hidden" />
        </div>
        <div className="flex w-full justify-between lg:flex-row">
          <div className="invisible h-4 w-px rounded-lg bg-gray-200 lg:flex lg:w-22" />
          <div className="h-4 w-22 rounded-lg bg-gray-200" />
        </div>
      </div>
      {Array(cards)
        .fill(1)
        .map((_i, idx) => (
          <SessionItemSkeleton key={idx} />
        ))}
    </div>
  </>
);

export default SessionCardSkeleton;
