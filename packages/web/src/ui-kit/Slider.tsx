/**
 * Styling based on https://stackoverflow.com/a/60560815
 */

import { ChangeEvent, Dispatch } from 'react';
import classNames from 'classnames';

export interface ISlider {
  min: number;
  max: number;
  value: number;
  step?: number;
  disabled?: boolean;
  className?: string;
  onChange: Dispatch<ChangeEvent<HTMLInputElement>>;
}

export default function Slider(props: ISlider) {
  const { value, min, max, disabled, className, ...inputProps } = props;

  function getLinearGradientCSS() {
    const percent = ((value - min) / (max - min)) * 100;
    return `linear-gradient(to right, var(--tw-gradient-from) ${percent}%, var(--tw-gradient-to) ${percent}%)`;
  }

  return (
    <input
      type="range"
      className={classNames(
        'outline-none h-2 w-full cursor-pointer appearance-none rounded-full',
        {
          'from-brand-primary to-gray-200': !disabled,
          'from-gray-400 to-gray-500': disabled,
        },
        className,
      )}
      style={{
        backgroundImage: getLinearGradientCSS(),
      }}
      {...inputProps}
      {...{ value, min, max, disabled }}
    />
  );
}
