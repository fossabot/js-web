import cx from 'classnames';
import Link from 'next/link';
import { ComponentPropsWithoutRef, forwardRef, ReactNode } from 'react';

export type ButtonProps = {
  variant?: 'primary' | 'secondary' | 'ghost' | 'round';
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  children: ReactNode;
  size?: 'small' | 'medium' | 'large';
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  iconWrapperClassName?: string;
  isLoading?: boolean;
  avoidFullWidth?: boolean;
  link?: string;
} & ComponentPropsWithoutRef<'button'>;

const ButtonComponent = forwardRef<any, any>((props, ref) =>
  props.link ? (
    <Link href={props.link}>
      <a {...props} ref={ref}>
        {props.children}
      </a>
    </Link>
  ) : (
    <button {...props} ref={ref}>
      {props.children}
    </button>
  ),
);

ButtonComponent.displayName = 'ButtonComponent';

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant,
      className,
      type = 'button',
      children,
      size,
      iconLeft,
      iconRight,
      iconWrapperClassName,
      avoidFullWidth = false,
      isLoading = false,
      ...props
    },
    ref,
  ) => {
    const getButtonStyling = () => {
      switch (variant) {
        case 'primary':
          return 'bg-brand-primary border-brand-primary active:bg-maroon-600 active:border-maroon-600 text-white disabled:bg-gray-200 disabled:border-gray-200 focus-visible:ring-brand-primary';
        case 'secondary':
          return 'bg-gray-100 border-gray-300 active:bg-gray-200 active:border-gray-700 text-black disabled:bg-gray-200 disabled:border-gray-200 focus:border-gray-200 focus-visible:ring-gray-300';
        case 'ghost':
          return 'bg-transparent border-transparent active:bg-maroon-200 text-brand-primary disabled:bg-transparent';
      }
    };

    const getButtonSize = () => {
      switch (size) {
        case 'small':
          return 'py-2 px-6 text-sm';
        case 'medium':
          return 'py-2 px-20px text-body';
        case 'large':
          return 'py-3 px-6 text-lg';
      }
    };

    const getOffsetPadding = () => {
      switch (size) {
        case 'medium':
          if (iconLeft) return 'pl-4';
          else return 'pr-4';
        default:
          if (iconLeft) return 'pl-20px';
          else return 'pr-20px';
      }
    };

    const getRoundButtonSize = () => {
      switch (size) {
        case 'small':
          return 'p-2 w-9 h-9';
        case 'medium':
          return 'p-3 w-12 h-12';
        case 'large':
          return 'p-3 w-14 h-14';
      }
    };

    if (variant === 'round') {
      return (
        <ButtonComponent
          className={cx(
            className,
            // Focus outline may need to change
            `outline-none focus:outline-none flex flex-row items-center justify-center rounded-full border transition-colors focus:ring`,
            `border-brand-primary bg-brand-primary active:border-maroon-600 active:bg-maroon-600 disabled:border-gray-200 disabled:bg-gray-200`,
            getRoundButtonSize(),
          )}
          type={type}
          {...props}
        >
          {children}
        </ButtonComponent>
      );
    }

    return (
      <ButtonComponent
        ref={ref}
        className={cx(
          className,
          // Focus outline may need to change
          `outline-none focus:outline-none flex flex-row items-center justify-center rounded-lg border transition-colors disabled:text-gray-400`,
          'focus-visible:ring-4 focus-visible:ring-offset-3',
          !avoidFullWidth && 'w-full',
          getButtonStyling(),
          getButtonSize(),
          // Offet -4px
          iconLeft && `${getOffsetPadding()}`,
          iconRight && `${getOffsetPadding()}`,
        )}
        type={type}
        {...props}
      >
        {iconLeft && <span className={iconWrapperClassName}>{iconLeft}</span>}
        {isLoading ? (
          <div className="loader h-5 w-5 animate-spin rounded-full border-4 border-gray-500" />
        ) : (
          children
        )}
        {iconRight && <span className={iconWrapperClassName}>{iconRight}</span>}
      </ButtonComponent>
    );
  },
);

Button.displayName = 'Button';

export default Button;
