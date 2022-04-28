import React from 'react';
import { Check, Close } from './icons';

interface ISuccessMessageProps {
  title: string;
  onClearAction?: () => void;
}

function SuccessMessage({ title, onClearAction }: ISuccessMessageProps) {
  if (!title) {
    return null;
  }

  return (
    <div className="flex w-full justify-center">
      <div className="border-text-300 lg:mx-max absolute z-20 mx-6 rounded-lg bg-green-200 p-4 text-left text-white">
        <div className="flex items-center">
          <div>
            <div className="rounded-full bg-green-300 p-0.5 text-white">
              <Check className="h-8 w-8" />
            </div>
          </div>

          <p className="mx-2 font-semibold">{title}</p>
          <div>
            {onClearAction ? (
              <div
                onClick={onClearAction}
                className="cursor-pointer rounded-full p-0.5 text-white"
              >
                <Close className="h-8 w-8" />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SuccessMessage;
