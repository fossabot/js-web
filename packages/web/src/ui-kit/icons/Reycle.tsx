import * as React from 'react';

function SvgComponent(props) {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M11.478 3.555a.667.667 0 11-.993.89 3.333 3.333 0 00-5.818 2.222H6a.667.667 0 01.471 1.138l-2 2a.667.667 0 01-.942 0l-2-2A.667.667 0 012 6.667h1.333a4.667 4.667 0 018.145-3.112zM14.471 8.195A.667.667 0 0114 9.333h-1.333v.002a4.667 4.667 0 01-8.145 3.11.667.667 0 01.993-.89 3.333 3.333 0 005.818-2.222H10a.667.667 0 01-.471-1.138l2-2c.26-.26.682-.26.942 0l2 2z"
        fill="currentColor"
      />
    </svg>
  );
}

export default SvgComponent;
