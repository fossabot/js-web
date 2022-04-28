import React from 'react';
import { Close } from './icons';

interface IErrorMessagesProps {
  title?: string;
  messages: string[];
  onClearAction?: () => void;
}

function ErrorMessages({
  title = '',
  messages = [],
  onClearAction,
}: IErrorMessagesProps) {
  if (messages.length < 1) {
    return null;
  }

  return (
    <div className="border-text-300 relative mx-auto my-4 w-full border bg-red-100 p-3 text-left text-red-300">
      {!!title && <div className="font-semibold">{title}</div>}
      <ul>
        {messages.map((msg, index) => (
          <li key={index}>{msg}</li>
        ))}
      </ul>
      {onClearAction ? (
        <div
          onClick={onClearAction}
          className="absolute -right-2 -top-2 cursor-pointer rounded-full bg-gray-700 p-0.5 text-white"
        >
          <Close />
        </div>
      ) : null}
    </div>
  );
}

export default ErrorMessages;
