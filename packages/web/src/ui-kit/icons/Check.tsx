import * as React from 'react';

function SvgComponent(props) {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M13.366 4.234a.8.8 0 010 1.132l-6.4 6.4a.8.8 0 01-1.132 0l-3.2-3.2a.8.8 0 011.132-1.132L6.4 10.07l5.834-5.835a.8.8 0 011.132 0z"
        fill="currentColor"
      />
    </svg>
  );
}

export default SvgComponent;
