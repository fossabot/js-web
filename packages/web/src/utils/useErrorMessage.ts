import { useState } from 'react';

export function useErrorMessage() {
  const [message, setMessage] = useState<string[]>();

  function clearMessage() {
    setMessage([]);
  }

  return {
    message,
    setMessage,
    clearMessage,
  };
}
