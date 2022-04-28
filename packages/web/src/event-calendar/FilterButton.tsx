import { ReactNode } from 'react';
import cx from 'classnames';
import { Check } from '../ui-kit/icons';

interface IFilterButtonProps {
  isActive: boolean;
  onClick: () => void;
  text: ReactNode;
  icon?: (props) => JSX.Element;
}

export const FilterButton = ({
  onClick,
  isActive,
  text,
  icon,
}: IFilterButtonProps) => {
  const Icon = icon;
  return (
    <button
      type="button"
      className="flex w-full items-center space-x-4 p-4 hover:bg-gray-200"
      onClick={onClick}
    >
      {icon && (
        <Icon
          className={cx('h-20px w-20px', {
            'text-brand-primary': isActive,
            'text-gray-500': !isActive,
          })}
        />
      )}
      <div
        className={cx('flex-1 text-left text-caption font-semibold', {
          'text-brand-primary': isActive,
          'text-gray-650': !isActive,
        })}
      >
        {text}
      </div>
      {isActive && <Check className="h-20px w-20px text-brand-primary" />}
    </button>
  );
};
