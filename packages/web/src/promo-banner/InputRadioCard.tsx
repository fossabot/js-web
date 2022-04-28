import React, { Dispatch, FC } from 'react';
import InputRadio from '../ui-kit/InputRadio';
import cx from 'classnames';

export interface IInputRadioCard {
  className?: string;
  checked?: boolean;
  name: string;
  value: string;
  identifier: string;
  onChange: Dispatch<React.ChangeEvent>;
}

export const InputRadioCard: FC<IInputRadioCard> = (props) => {
  const { children, className, name, value, identifier, ...rest } = props;

  return (
    <label
      className={cx(
        'flex cursor-pointer items-center justify-center rounded-2xl border bg-gray-200 p-4 text-center',
        { 'border-brand-primary': identifier === value },
        className,
      )}
    >
      <div>{children}</div>
      <InputRadio
        name="gradient"
        inputWrapperClassName="hidden"
        {...{ name, value: identifier }}
        {...rest}
      />
    </label>
  );
};
