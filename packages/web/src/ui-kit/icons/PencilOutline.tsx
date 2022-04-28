import * as React from 'react';

function SvgPencilOutline(props) {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M9.334 4l1.293-1.293a1 1 0 011.414 0l1.252 1.253a1 1 0 010 1.414L12 6.667M9.334 4L2.96 10.374a1 1 0 00-.293.707v1.252a1 1 0 001 1h1.252a1 1 0 00.708-.293L12 6.667M9.334 4L12 6.667"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default SvgPencilOutline;
