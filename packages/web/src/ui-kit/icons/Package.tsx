import * as React from 'react';

function SvgPackage(props) {
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
        d="M6.667 2.5C5.747 2.5 5 3.246 5 4.167h10c0-.92-.746-1.667-1.667-1.667H6.667zM3.333 6.667C3.333 5.747 4.08 5 5 5h10c.92 0 1.667.746 1.667 1.667H3.333zm0 .833c-.92 0-1.666.746-1.666 1.667v6.666c0 .92.746 1.667 1.666 1.667h13.334c.92 0 1.666-.746 1.666-1.667V9.167c0-.92-.746-1.667-1.666-1.667H3.333z"
        fill="currentColor"
      />
    </svg>
  );
}

export default SvgPackage;
