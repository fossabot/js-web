import * as React from 'react';

function SvgComponent(props) {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 25 25"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5.67871 3.75C4.02186 3.75 2.67871 5.09315 2.67871 6.75V14.75C2.67871 16.4069 4.02186 17.75 5.67871 17.75H9.67871V19.75H8.67871C8.12643 19.75 7.67871 20.1977 7.67871 20.75C7.67871 21.3023 8.12643 21.75 8.67871 21.75H16.6787C17.231 21.75 17.6787 21.3023 17.6787 20.75C17.6787 20.1977 17.231 19.75 16.6787 19.75H15.6787V17.75H19.6787C21.3356 17.75 22.6787 16.4069 22.6787 14.75V6.75C22.6787 5.09315 21.3356 3.75 19.6787 3.75H5.67871Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default SvgComponent;
