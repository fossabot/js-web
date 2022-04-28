import * as React from 'react';

function SvgComponent(props) {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9 2.25a4.5 4.5 0 00-2.731 8.077C4.36 11.18 3 12.906 3 15c0 .414.336.75.75.75h10.5A.75.75 0 0015 15c0-2.094-1.36-3.82-3.269-4.673A4.5 4.5 0 009 2.25z"
        fill="currentColor"
      />
    </svg>
  );
}

export default SvgComponent;
