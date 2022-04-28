import { SVGProps } from 'react';

function SvgComponent(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="32"
      height="33"
      viewBox="0 0 32 33"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M20.781 4.57036C21.8224 3.52896 23.5109 3.52896 24.5523 4.57036L28 8.01807C29.0414 9.05947 29.0414 10.7479 28 11.7893L25.8856 13.9037L18.6667 6.68474L20.781 4.57036ZM16.781 8.57035L4.78105 20.5704C4.28095 21.0705 4 21.7487 4 22.456V25.9037C4 27.3764 5.19391 28.5704 6.66667 28.5704H10.1144C10.8216 28.5704 11.4999 28.2894 12 27.7893L24 15.7893L16.781 8.57035Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default SvgComponent;
