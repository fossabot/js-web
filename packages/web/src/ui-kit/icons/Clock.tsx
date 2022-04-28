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
        d="M1.667 10a8.333 8.333 0 1116.666 0 8.333 8.333 0 01-16.666 0zm9.166-4.167a.833.833 0 10-1.666 0V8.97a2.5 2.5 0 001.382 2.236l2.412 1.206a.833.833 0 10.745-1.49l-2.412-1.207a.833.833 0 01-.46-.745V5.833z"
        fill="currentColor"
      />
    </svg>
  );
}

export default SvgComponent;
