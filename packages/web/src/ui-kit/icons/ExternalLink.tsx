import * as React from 'react';

function SvgComponent(props) {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4.333 5.333a1 1 0 011-1h3a1 1 0 100-2h-3a3 3 0 00-3 3v9.334a3 3 0 003 3h9.334a3 3 0 003-3v-3a1 1 0 00-2 0v3a1 1 0 01-1 1H5.333a1 1 0 01-1-1V5.333zm8.167-3a1 1 0 100 2h1.752l-4.96 4.96a1 1 0 001.415 1.414l4.96-4.96V7.5a1 1 0 102 0V3.333a1 1 0 00-1-1H12.5z"
        fill="currentColor"
      />
    </svg>
  );
}

export default SvgComponent;
