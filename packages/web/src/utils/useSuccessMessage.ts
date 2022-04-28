import { useState } from 'react';

export function useSuccessMessage() {
  const [message, setMessage] = useState<string>();

  function clearMessage() {
    setMessage('');
  }

  return {
    message,
    setMessage,
    clearMessage,
  };
}
