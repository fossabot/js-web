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
        d="M1.911 1.91a.833.833 0 011.179 0l2.545 2.546A8.912 8.912 0 0110 3.333c2.903 0 5.05 1.314 6.51 2.719a12.574 12.574 0 012.5 3.425c.16.333.16.716 0 1.046-.284.587-1.313 2.527-3.235 4.073l2.315 2.315a.833.833 0 11-1.179 1.178l-15-15a.833.833 0 010-1.178zm10.961 9.783a3.333 3.333 0 00-4.565-4.565L9.57 8.39a1.669 1.669 0 012.042 2.042l1.261 1.261zM4.238 7.156l2.455 2.426a3.333 3.333 0 003.766 3.72l1.239 1.224c.68.672.395 1.97-.713 2.089a9.312 9.312 0 01-.985.052c-2.902 0-5.05-1.314-6.508-2.719A12.572 12.572 0 01.99 10.523a1.2 1.2 0 010-1.048c.18-.371.638-1.24 1.404-2.211a1.238 1.238 0 011.843-.108z"
        fill="currentColor"
      />
    </svg>
  );
}

export default SvgComponent;
