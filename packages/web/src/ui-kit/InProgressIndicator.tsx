import { FC } from 'react';

export const InProgressIndicator: FC<Record<string, never>> = () => {
  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-yellow-200 bg-white">
      <div className="h-5 w-5 rounded-full border border-yellow-200 bg-yellow-100" />
    </div>
  );
};
