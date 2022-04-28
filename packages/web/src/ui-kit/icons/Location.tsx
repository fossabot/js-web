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
        d="M7.99992 14C7.99992 14 12.6666 11.1176 12.6666 6.66667C12.6666 4.0157 10.5772 2 7.99992 2C5.42259 2 3.33325 4.0157 3.33325 6.66667C3.33325 11.1176 7.99992 14 7.99992 14ZM5.99998 6.66672C5.99998 5.56215 6.89541 4.66672 7.99998 4.66672C9.10455 4.66672 9.99998 5.56215 9.99998 6.66672C9.99998 7.77129 9.10455 8.66673 7.99998 8.66673C6.89541 8.66673 5.99998 7.77129 5.99998 6.66672Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default SvgComponent;
