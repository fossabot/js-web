import * as React from 'react';

function SvgComponent(props) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4.33333 2.66667C4.33333 2.29848 4.03486 2 3.66667 2C3.29848 2 3 2.29848 3 2.66667V13.3333C3 13.7015 3.29848 14 3.66667 14C4.03486 14 4.33333 13.7015 4.33333 13.3333V10H11.6667C11.9363 10 12.1794 9.83757 12.2826 9.58846C12.3858 9.33934 12.3287 9.05259 12.1381 8.86193L9.94281 6.66667L12.1381 4.4714C12.3287 4.28074 12.3858 3.99399 12.2826 3.74488C12.1794 3.49576 11.9363 3.33333 11.6667 3.33333H4.33333V2.66667Z"
        fill="currentColor"
      />
      <rect x="3" y="2" width="1.4" height="12" rx="0.7" fill="currentColor" />
    </svg>
  );
}

export default SvgComponent;
