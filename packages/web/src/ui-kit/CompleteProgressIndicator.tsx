import { FC } from 'react';
import { Check } from './icons';

export const CompleteProgressIndicator: FC<Record<string, never>> = () => {
  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-200">
      <Check width={20} height={20} />
    </div>
  );
};
