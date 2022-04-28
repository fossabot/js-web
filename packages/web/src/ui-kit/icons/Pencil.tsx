import { SVGProps } from 'react';

function SvgComponent(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M9.33333 4L10.6262 2.70711C11.0167 2.31658 11.6499 2.31658 12.0404 2.70711L13.2929 3.95956C13.6834 4.35008 13.6834 4.98325 13.2929 5.37377L12 6.66667M9.33333 4L2.95956 10.3738C2.77202 10.5613 2.66666 10.8157 2.66666 11.0809V12.3333C2.66666 12.8856 3.11438 13.3333 3.66666 13.3333H4.91912C5.18433 13.3333 5.43869 13.228 5.62622 13.0404L12 6.66667M9.33333 4L12 6.66667"
        stroke="black"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default SvgComponent;
