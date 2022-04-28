import * as React from 'react';

function SvgClipboardCopy(props) {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 17 17"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.617 2.917a.667.667 0 00-.667.666v.002a.667.667 0 00.667.665h2.667a.667.667 0 000-1.333H7.617zm0-1.334A2 2 0 005.73 2.917h-.78a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2V10.25H9.225l.862.862a.667.667 0 01-.943.943l-2-2a.667.667 0 010-.943l2-2a.667.667 0 01.943.943l-.862.862h5.724v-4a2 2 0 00-2-2h-.78a2 2 0 00-1.886-1.334H7.617z"
        fill="currentColor"
      />
    </svg>
  );
}

export default SvgClipboardCopy;
