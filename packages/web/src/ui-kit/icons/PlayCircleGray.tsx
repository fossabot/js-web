import * as React from 'react';

function SvgComponent(props) {
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M12 1C5.92487 1 1 5.92487 1 12C1 18.0751 5.92487 23 12 23C18.0751 23 23 18.0751 23 12C23 5.92487 18.0751 1 12 1Z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.58306 7.22678C9.90099 7.05663 10.2868 7.07528 10.5868 7.2753L16.4535 11.1864C16.7255 11.3678 16.8889 11.6731 16.8889 12C16.8889 12.3269 16.7255 12.6322 16.4535 12.8135L10.5868 16.7246C10.2868 16.9247 9.90099 16.9433 9.58306 16.7732C9.26512 16.603 9.06665 16.2717 9.06665 15.9111V8.08886C9.06665 7.72826 9.26512 7.39693 9.58306 7.22678Z"
        fill="white"
      />
    </svg>
  );
}

export default SvgComponent;
