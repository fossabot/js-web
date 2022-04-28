import { useState } from 'react';
import { FaCaretDown, FaCaretRight } from 'react-icons/fa';
import { IGroup } from '../models/group';

interface IGroupItemsProps {
  items: IGroup[];
  parent?: IGroup['id'];
  onGroupClick: (group: IGroup) => void;
}

const GroupItems = ({ items, parent, onGroupClick }: IGroupItemsProps) => {
  const [showChildren, setShowChildren] = useState({});

  return (
    <>
      {items.map((item) => {
        return (
          <div
            className={`mt-2 pl-2 ${parent ? 'mb-2' : 'mb-5'}`}
            key={item.id}
          >
            <div
              className={`font-bold ${
                parent ? 'text-sm' : 'text-md'
              } flex cursor-pointer flex-row items-center pr-3 ${
                !parent || item.children?.length ? '' : 'text-gray-500'
              }`}
              onClick={async () => {
                await onGroupClick(item);
                setShowChildren({
                  ...showChildren,
                  [item.id]: !showChildren[item.id],
                });
              }}
            >
              <span className="pr-4">{item.name}</span>
              {item.children?.length && showChildren[item.id] ? (
                <div>
                  <FaCaretDown />
                </div>
              ) : item.children?.length ? (
                <FaCaretRight />
              ) : (
                ''
              )}
            </div>
            {item.children?.length && showChildren[item.id] ? (
              <GroupItems
                items={item.children}
                parent={item.id}
                onGroupClick={onGroupClick}
              />
            ) : null}
          </div>
        );
      })}
    </>
  );
};

export default GroupItems;
