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
        d="M18.7077 17.3551C21.2268 14.2005 21.2326 9.6591 18.7192 6.49864C15.4345 2.36463 9.39385 2.09018 5.73939 5.66375L4.07538 3.99975C3.98293 3.9073 3.81827 3.97375 3.79804 4.10952L2.88804 10.052C2.87359 10.1531 2.95737 10.2369 3.05848 10.2224L9.00096 9.31244C9.13673 9.29222 9.20029 9.12466 9.11073 9.0351L7.44962 7.37398C10.0294 4.87508 14.2241 5.00219 16.6334 7.75821C18.7077 10.1271 18.699 13.7411 16.619 16.1042C14.4148 18.6089 10.7314 18.9296 8.14873 17.0634C7.66917 16.7167 7.00761 16.7774 6.59161 17.1934C6.0745 17.7105 6.12939 18.5743 6.72161 19.0047C10.3934 21.6712 15.6974 21.1223 18.7077 17.3551Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default SvgComponent;
