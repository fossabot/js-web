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
        d="M5.529 3.529a.667.667 0 000 .942L9.057 8 5.53 11.529a.667.667 0 10.942.942l4-4a.667.667 0 000-.942l-4-4a.667.667 0 00-.942 0z"
        fill="currentColor"
      />
    </svg>
  );
}

export default SvgComponent;
