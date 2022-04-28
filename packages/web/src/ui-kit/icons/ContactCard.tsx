import * as React from 'react';

function SvgContact(props) {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 25 25"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5.95 4.25a3 3 0 00-3 3v10a3 3 0 003 3h14a3 3 0 003-3v-10a3 3 0 00-3-3h-14zm7 7c0 .662-.214 1.275-.578 1.77.62.465 1.073 1.088 1.444 1.73a1 1 0 11-1.731 1c-.314-.541-.61-.908-.93-1.142-.297-.217-.664-.358-1.205-.358-.54 0-.908.14-1.205.358-.319.234-.616.6-.93 1.143a1 1 0 01-1.73-1.002c.37-.641.824-1.264 1.443-1.728a3 3 0 115.422-1.77zm3-3a1 1 0 100 2h3a1 1 0 100-2h-3zm0 3a1 1 0 100 2h3a1 1 0 100-2h-3zm0 3a1 1 0 100 2h1a1 1 0 100-2h-1zm-6-2a1 1 0 100-2 1 1 0 000 2z"
        fill="currentColor"
      />
    </svg>
  );
}

export default SvgContact;
