import * as React from 'react';

function SvgComponent(props) {
  return (
    <svg
      width="6"
      height="4"
      viewBox="0 0 6 4"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M3.0013 3.5L0.334636 0.833333L5.66797 0.833333L3.0013 3.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default SvgComponent;
