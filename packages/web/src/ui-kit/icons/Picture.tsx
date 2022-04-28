import { SVGProps } from 'react';

function SvgComponent(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2.5 1C1.67157 1 1 1.67157 1 2.5V9.5C1 10.3284 1.67157 11 2.5 11H9.5C10.3284 11 11 10.3284 11 9.5V2.5C11 1.67157 10.3284 1 9.5 1H2.5ZM8.34174 6.84174L10 8.5C10 9.32843 9.32843 10 8.5 10L3 10C2.674 10 2.44763 9.8893 2.29383 9.73555L5.5896 6.76937C6.38025 6.05777 7.58958 6.08958 8.34174 6.84174ZM4 3C3.44772 3 3 3.44772 3 4C3 4.55228 3.44772 5 4 5C4.55228 5 5 4.55228 5 4C5 3.44772 4.55228 3 4 3Z"
        fill="#888A8D"
      />
    </svg>
  );
}

export default SvgComponent;
