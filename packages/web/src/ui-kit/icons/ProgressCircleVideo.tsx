import { SVGProps } from 'react';
import cx from 'classnames';

interface IProgressCircleOutline extends SVGProps<SVGSVGElement> {
  percentage: number;
}

function SvgComponent(props: IProgressCircleOutline) {
  const percent = props.percentage || 0;
  const radius = 29;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <svg
      width={60}
      height={60}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
      viewBox="0 0 64 64"
    >
      <path
        d="M61.888 31.818c0 16.569-13.431 30-30 30-16.568 0-30-13.431-30-30 0-16.568 13.432-30 30-30 16.569 0 30 13.432 30 30zm-57.6 0c0 15.243 12.357 27.6 27.6 27.6 15.243 0 27.6-12.357 27.6-27.6 0-15.243-12.357-27.6-27.6-27.6-15.243 0-27.6 12.357-27.6 27.6z"
        fill="#ECEDED"
        strokeDashoffset={offset}
      />
      <circle
        cx={32}
        cy={32}
        r={radius}
        fill="transparent"
        stroke="currentColor"
        strokeWidth={2}
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className={cx('origin-center -rotate-90 transform', {
          'text-gray-200': percent <= 0,
          'text-green-200': percent > 0,
        })}
      />
    </svg>
  );
}

export default SvgComponent;
