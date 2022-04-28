import React, { FC, useState } from 'react';

export interface ICourseOutlineTab {
  onTabClick: (key: string) => any;
  defaultActiveKey?: string;
}

export const CourseOutlineTab: FC<ICourseOutlineTab> = (props) => {
  const { onTabClick, defaultActiveKey, children } = props;
  const [active, setActive] = useState<string>(defaultActiveKey);

  function handleClick(key: string) {
    setActive(key);
    onTabClick(key);
  }

  return (
    <div className="flex w-auto space-x-10 rounded-2xl border border-gray-200 px-7 lg:w-5/12">
      {React.Children.map(
        children,
        (child) =>
          React.isValidElement(child) &&
          React.cloneElement(child, {
            onClick: () => handleClick(child.props.tabKey),
            active: child.props.tabKey === active,
          }),
      )}
    </div>
  );
};
