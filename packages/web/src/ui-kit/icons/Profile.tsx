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
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16 4C11.5818 4 8.00004 7.58172 8.00004 12C8.00004 14.5924 9.23308 16.8967 11.1447 18.3586C7.7517 19.8756 5.33337 22.9439 5.33337 26.6667C5.33337 27.403 5.93033 28 6.66671 28H25.3334C26.0698 28 26.6667 27.403 26.6667 26.6667C26.6667 22.9439 24.2484 19.8756 20.8554 18.3586C22.767 16.8967 24 14.5924 24 12C24 7.58172 20.4183 4 16 4Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default SvgComponent;
