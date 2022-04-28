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
        d="M21.5667 10.8L14.9 5.80004C13.9111 5.0584 12.5 5.76397 12.5 7.00004V10L6.9 5.80004C5.91115 5.0584 4.5 5.76397 4.5 7.00004V17C4.5 18.2361 5.91115 18.9417 6.9 18.2L12.5 14V17C12.5 18.2361 13.9111 18.9417 14.9 18.2L21.5667 13.2C22.3667 12.6 22.3667 11.4 21.5667 10.8Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default SvgComponent;
