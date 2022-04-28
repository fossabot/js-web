import * as React from 'react';

interface IDoorOpenIconProps {
  keepColor?: boolean;
}

function SvgComponent({ keepColor = true, ...props }: IDoorOpenIconProps) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M9.99935 9.16643H8.33268V10.8331H9.99935V9.16643Z"
        fill={keepColor ? '#C1C2C4' : 'currentColor'}
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M1.66602 17.4998V15.8331H3.33268V4.02893C3.33268 3.6256 3.62102 3.2806 4.01685 3.20894L11.9102 1.77393C12.1818 1.72393 12.4418 1.90477 12.491 2.17643C12.4969 2.2056 12.4993 2.23477 12.4993 2.2656V4.99977V17.4998H1.66602ZM8.33268 9.16643H9.99935V10.8331H8.33268V9.16643Z"
        fill={keepColor ? '#C1C2C4' : 'currentColor'}
      />
      <path
        d="M16.6668 4.16634C16.6668 3.70634 16.2934 3.33301 15.8334 3.33301H12.4922V4.99967H15.0001V17.4997H18.3334V15.833H16.6668V4.16634Z"
        fill={keepColor ? '#6A6B6E' : 'currentColor'}
      />
      <rect
        x="8.13477"
        y="8.88672"
        width="2"
        height="2"
        rx="1"
        fill={keepColor ? '#6A6B6E' : 'currentColor'}
      />
    </svg>
  );
}

export default SvgComponent;
