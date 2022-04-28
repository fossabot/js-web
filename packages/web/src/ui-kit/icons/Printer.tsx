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
        d="M5 3.8a.6.6 0 01.6-.6h4.8a.6.6 0 01.6.6v.6H5v-.6zm-1.2.6v-.6A1.8 1.8 0 015.6 2h4.8a1.8 1.8 0 011.8 1.8v.6A1.8 1.8 0 0114 6.2v3.6a1.8 1.8 0 01-1.8 1.8h-.6v.6A1.8 1.8 0 019.8 14H6.2a1.8 1.8 0 01-1.8-1.8v-.6h-.6A1.8 1.8 0 012 9.8V6.2a1.8 1.8 0 011.8-1.8zm6.6 5.4a.6.6 0 00-.6-.6H6.2a.6.6 0 00-.6.6v2.4a.6.6 0 00.6.6h3.6a.6.6 0 00.6-.6V9.8zm-6-3a.6.6 0 01.6-.6h1.2a.6.6 0 010 1.2H5a.6.6 0 01-.6-.6z"
        fill="currentColor"
      />
    </svg>
  );
}

export default SvgComponent;
