import { SVGProps } from 'react';

function SvgComponent(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={25}
      height={24}
      viewBox="0 0 25 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3.4335 10.8L10.1002 5.80004C11.089 5.0584 12.5002 5.76397 12.5002 7.00004V10L18.1002 5.80004C19.089 5.0584 20.5002 5.76397 20.5002 7.00004V17C20.5002 18.2361 19.089 18.9417 18.1002 18.2L12.5002 14V17C12.5002 18.2361 11.089 18.9417 10.1002 18.2L3.4335 13.2C2.63349 12.6 2.6335 11.4 3.4335 10.8Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default SvgComponent;
