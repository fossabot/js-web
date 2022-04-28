import * as React from 'react';

function SvgComponent(props) {
  return (
    <svg
      width={32}
      height={32}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M17.2341 4.88031C17.7977 4.31666 18.5622 4 19.3593 4C21.2166 4 22.6293 5.66769 22.324 7.49968L21.5732 12.0042C25.144 12.1305 28 15.0651 28 18.6667V21.3333C28 25.0152 25.0152 28 21.3333 28H10.6667V11.4477L17.2341 4.88031ZM8 12C5.79086 12 4 13.7909 4 16V24C4 26.2091 5.79086 28 8 28V12Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default SvgComponent;
