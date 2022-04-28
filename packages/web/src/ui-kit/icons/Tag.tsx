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
        fillRule="evenodd"
        clipRule="evenodd"
        d="M15.2254 7.33709C15.5915 7.7032 15.5915 8.2968 15.2254 8.66291L8.66291 15.2254C8.2968 15.5915 7.7032 15.5915 7.33709 15.2254L0.774588 8.66291C0.5915 8.47983 0.499971 8.23985 0.5 7.99989V3.3125C0.5 1.7592 1.7592 0.5 3.3125 0.5H8.00026C8.2401 0.500065 8.47992 0.591594 8.66291 0.774587L15.2254 7.33709ZM3.3125 4.25C3.83027 4.25 4.25 3.83027 4.25 3.3125C4.25 2.79473 3.83027 2.375 3.3125 2.375C2.79473 2.375 2.375 2.79473 2.375 3.3125C2.375 3.83027 2.79473 4.25 3.3125 4.25Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default SvgComponent;
