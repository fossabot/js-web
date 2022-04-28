import * as React from 'react';

function SvgComponent(props) {
  return (
    <svg
      width="6"
      height="3"
      viewBox="0 0 6 3"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M2.9987 0.166626L5.66536 2.83329H0.332031L2.9987 0.166626Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default SvgComponent;
