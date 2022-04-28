import * as React from 'react';

function SvgFileDuplicate(props) {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 25 25"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M17.78 20.25H8.95a3 3 0 01-3-3V6.42a3.001 3.001 0 00-2 2.83v10a3 3 0 003 3h8a3.001 3.001 0 002.83-2zm-9.83-15v12a1 1 0 001 1h10a3 3 0 003-3V9.078a3 3 0 00-.878-2.12l-3.829-3.83a3 3 0 00-2.121-.878H10.95a3 3 0 00-3 3z"
        fill="currentColor"
      />
    </svg>
  );
}

export default SvgFileDuplicate;
