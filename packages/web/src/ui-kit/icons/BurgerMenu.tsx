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
        d="M2 6C2 4.89543 2.89543 4 4 4H20C21.1046 4 22 4.89543 22 6C22 7.10457 21.1046 8 20 8H4C2.89543 8 2 7.10457 2 6ZM2 12C2 10.8954 2.89543 10 4 10H20C21.1046 10 22 10.8954 22 12C22 13.1046 21.1046 14 20 14H4C2.89543 14 2 13.1046 2 12ZM2 18C2 16.8954 2.89543 16 4 16H20C21.1046 16 22 16.8954 22 18C22 19.1046 21.1046 20 20 20H4C2.89543 20 2 19.1046 2 18Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default SvgComponent;
