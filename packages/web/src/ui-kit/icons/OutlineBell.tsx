import * as React from 'react';

function SvgComponent(props) {
  return (
    <svg
      width={32}
      height={32}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M19 21h5l-1.405-1.405A2.032 2.032 0 0122 18.16V15a6.003 6.003 0 00-4-5.659V9a2 2 0 10-4 0v.341c-2.33.824-4 3.047-4 5.659v3.159c0 .538-.214 1.055-.595 1.436L8 21h5m6 0v1a3 3 0 11-6 0v-1m6 0h-6"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default SvgComponent;
