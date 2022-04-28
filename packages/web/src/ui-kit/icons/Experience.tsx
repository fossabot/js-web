import * as React from 'react';

function SvgExperience(props) {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 20 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5 3a2 2 0 00-2 2v14l3.5-2 3.5 2 3.5-2 3.5 2V5a2 2 0 00-2-2H5zm5.57 3.756c-.179-.553-.961-.553-1.14 0L9.011 8.04a.6.6 0 01-.57.415h-1.35c-.582 0-.824.744-.353 1.085l1.092.794a.6.6 0 01.218.67l-.417 1.285c-.18.553.453 1.012.923.67l1.092-.793a.6.6 0 01.706 0l1.092.794c.47.341 1.103-.118.923-.671l-.417-1.284a.6.6 0 01.218-.671l1.092-.794c.47-.341.229-1.085-.352-1.085h-1.35a.6.6 0 01-.571-.415l-.417-1.284z"
        fill="currentColor"
      />
    </svg>
  );
}

export default SvgExperience;
