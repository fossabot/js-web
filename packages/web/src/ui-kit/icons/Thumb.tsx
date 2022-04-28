import * as React from 'react';

function SvgComponent(props) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.61704 2.44016C8.89886 2.15833 9.2811 2 9.67966 2C10.6083 2 11.3147 2.83384 11.162 3.74984L10.7866 6.00212C12.572 6.06527 14 7.53254 14 9.33333V10.6667C14 12.5076 12.5076 14 10.6667 14H5.33333V5.72386L8.61704 2.44016ZM4 6C2.89543 6 2 6.89543 2 8V12C2 13.1046 2.89543 14 4 14V6Z"
        fill="currentColor"
      />
      <path
        d="M2 8C2 6.89543 2.89543 6 4 6V14C2.89543 14 2 13.1046 2 12V8Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default SvgComponent;
