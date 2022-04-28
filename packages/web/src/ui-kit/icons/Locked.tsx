import * as React from 'react';

function SvgLocked(props) {
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
        d="M10 3.333a2.5 2.5 0 00-2.5 2.5v2.5h5v-2.5a2.5 2.5 0 00-2.5-2.5zm-4.167 2.5v2.5H5a2.5 2.5 0 00-2.5 2.5v5a2.5 2.5 0 002.5 2.5h10a2.5 2.5 0 002.5-2.5v-5a2.5 2.5 0 00-2.5-2.5h-.833v-2.5a4.167 4.167 0 00-8.334 0zm5 6.667a.833.833 0 00-1.666 0v1.667a.833.833 0 001.666 0V12.5z"
        fill="currentColor"
      />
    </svg>
  );
}

export default SvgLocked;
