import cx from 'classnames';
import * as React from 'react';

import Check from './Check';

function SvgComponent(props) {
  const percent = props.percentage || 0;
  const radius = 13;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <svg
      width={36}
      height={36}
      {...props}
      fill="none"
      viewBox="0 0 36 36"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g>
        <circle
          className={cx({
            'text-gray-300': percent <= 0,
            'text-yellow-100': percent > 0 && percent < 100,
            'text-green-150': percent >= 100,
          })}
          stroke="currentColor"
          fill={percent >= 100 ? 'currentColor' : 'transparent'}
          strokeWidth="8"
          r={radius}
          cx="18"
          cy="18"
        />
        {percent >= 100 ? (
          <Check className="inline h-4 w-4 text-green-200" x={10} y={10} />
        ) : (
          <circle
            className={cx('origin-center -rotate-90 transform', {
              'text-gray-300': percent <= 0,
              'text-yellow-300': percent > 0 && percent < 100,
              'text-green-150': percent >= 100,
            })}
            stroke="currentColor"
            strokeWidth="8"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={offset}
            strokeLinecap="round"
            fill="transparent"
            r={radius}
            cx="18"
            cy="18"
          />
        )}
      </g>
    </svg>
  );
}

export default SvgComponent;
