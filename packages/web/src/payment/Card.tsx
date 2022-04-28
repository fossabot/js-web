import {
  FieldHelperProps,
  FieldInputProps,
  FieldMetaProps,
  useField,
} from 'formik';
import { FC, ReactNode } from 'react';
import { PaymentOption } from './paymentForm.schema';
import cx from 'classnames';
import CheckBox from '../ui-kit/CheckBox';

export type FormikUseFieldHook<T = any> = [
  FieldInputProps<T>,
  FieldMetaProps<T>,
  FieldHelperProps<T>,
];

export interface ICard {
  description: (
    checked: boolean,
    value: FormikUseFieldHook,
    props: ICard,
  ) => ReactNode;
  cardIcon: (
    checked: boolean,
    value: FormikUseFieldHook,
    props: ICard,
  ) => ReactNode;
  name: string;
  value: PaymentOption;
  disabled?: boolean;
}

export const Card: FC<ICard> = (props) => {
  const { description, cardIcon, name, value, disabled } = props;
  const hookValues = useField(name);
  const [field] = hookValues;
  const checked = field.value === value;

  function handleClick() {
    if (disabled) {
      return;
    }
    field.onChange({ target: { name, value } });
  }

  return (
    <label
      className={cx(
        'cursor-pointer rounded-2xl p-1 lg:w-40',
        checked ? 'border-2 border-brand-primary' : 'border border-gray-300', // border-2 on checked will cause inside element be pushed in by 1px, but barely noticable
        disabled ? 'cursor-not-allowed border-gray-300 bg-gray-200' : '',
      )}
    >
      <div
        className={cx(
          'rounded-2xl bg-contain p-2 lg:flex lg:h-24 lg:flex-col lg:justify-between lg:px-3 lg:py-3',
          checked ? 'bg-no-repeat lg:bg-card' : '',
        )}
      >
        <section className="flex space-x-4">
          <aside className="self-center">
            <CheckBox
              readOnly
              type="round"
              name={name}
              checked={checked}
              value={value}
              onChange={handleClick}
              disabled={disabled}
            />
          </aside>
          <section
            className={cx(
              'flex-grow self-center lg:hidden lg:flex-grow-0',
              checked ? 'lg:text-white' : 'text-black',
            )}
          >
            {description(checked, hookValues, props)}
          </section>
          <aside className="flex flex-grow flex-row-reverse self-start lg:self-center">
            {cardIcon(checked, hookValues, props)}
          </aside>
        </section>
        <section
          className={cx(
            'hidden lg:block',
            checked ? 'lg:text-white' : 'text-black',
          )}
        >
          {description(checked, hookValues, props)}
        </section>
      </div>
    </label>
  );
};
