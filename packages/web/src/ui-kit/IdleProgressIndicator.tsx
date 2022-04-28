import { FC } from 'react';

export const IdleProgressIndicator: FC<Record<string, never>> = () => {
  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white">
      <div className="h-5 w-5 rounded-full bg-gray-200" />
    </div>
  );
};
