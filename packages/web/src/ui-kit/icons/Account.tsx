import * as React from 'react';

function SvgAccount(props) {
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
        d="M8.333 3.333a.833.833 0 00-.833.833v.003A.834.834 0 008.333 5h3.334a.834.834 0 000-1.667H8.333zm0-1.666a2.501 2.501 0 00-2.357 1.666H5a2.5 2.5 0 00-2.5 2.5v10a2.5 2.5 0 002.5 2.5h10a2.5 2.5 0 002.5-2.5v-10a2.5 2.5 0 00-2.5-2.5h-.976a2.501 2.501 0 00-2.357-1.666H8.333zM6.667 8.333a.833.833 0 100 1.667h6.666a.833.833 0 100-1.667H6.667zm0 3.334a.833.833 0 100 1.666H10a.833.833 0 000-1.666H6.667z"
        fill="currentColor"
      />
    </svg>
  );
}

export default SvgAccount;
