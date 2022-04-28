import * as React from 'react';

function SvgComponent(props) {
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 4C8.517 4 5.94 5.577 4.19 7.262a15.088 15.088 0 00-3.001 4.11 1.435 1.435 0 000 1.255 15.088 15.088 0 003 4.111C5.94 18.423 8.518 20 12 20c3.483 0 6.06-1.577 7.81-3.262a15.086 15.086 0 003.001-4.11 1.435 1.435 0 000-1.255 15.086 15.086 0 00-3-4.111C18.06 5.577 15.483 4 12 4zm0 4a4 4 0 100 8 4 4 0 000-8zm0 6a2 2 0 100-4 2 2 0 000 4z"
        fill="currentColor"
      />
    </svg>
  );
}

export default SvgComponent;
