import classNames from 'classnames';
import { FC } from 'react';

export interface CourseOutlineTabItem {
  tabKey: string;
  onClick?: () => any;
  active?: boolean;
  activeIcon?: React.ReactNode;
  inactiveIcon?: React.ReactNode;
}

export const CourseOutlineTabItem: FC<CourseOutlineTabItem> = (props) => {
  const { onClick, active, activeIcon, inactiveIcon } = props;

  return (
    <div
      className={classNames(
        'flex cursor-pointer items-center py-4 text-caption font-semibold',
        {
          'border-b-2': active,
          'border-brand-primary': active,
          'text-brand-primary': active,
          'text-gray-500': !active,
        },
      )}
      onClick={onClick}
    >
      {active ? activeIcon : inactiveIcon}
      {props.children}
    </div>
  );
};
