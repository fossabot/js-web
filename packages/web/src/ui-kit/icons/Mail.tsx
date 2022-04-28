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
        d="M4.167 16.667a2.5 2.5 0 01-2.5-2.5V5.833a2.5 2.5 0 012.5-2.5h11.666a2.5 2.5 0 012.5 2.5v8.334a2.5 2.5 0 01-2.5 2.5H4.167zm2.187-9.818a.833.833 0 00-1.041 1.302l3.125 2.5a2.5 2.5 0 003.124 0l3.125-2.5a.833.833 0 10-1.04-1.302l-3.126 2.5a.833.833 0 01-1.042 0l-3.125-2.5z"
        fill="currentColor"
      />
    </svg>
  );
}

export default SvgComponent;
