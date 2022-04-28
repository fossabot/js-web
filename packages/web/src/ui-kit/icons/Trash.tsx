import { SVGProps } from 'react';

function SvgComponent(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M6 4V4C6 2.89543 6.89543 2 8 2V2C9.10457 2 10 2.89543 10 4V4M6 4H10M6 4H3.33333M10 4H12.6667M14 4H12.6667M2 4H3.33333M3.33333 4V12C3.33333 13.1046 4.22876 14 5.33333 14H10.6667C11.7712 14 12.6667 13.1046 12.6667 12V4M6.66667 6.66667V11.3333M9.33333 11.3333V6.66667"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default SvgComponent;
