import Button from '../../ui-kit/Button';
import ChevronUp from '../../ui-kit/icons/ChevronUp';
import ChevronDown from '../../ui-kit/icons/ChevronDown';
import Close from '../../ui-kit/icons/Close';

interface IMenuItem {
  id: string;
  name: string;
}

interface IMenuItemsProps {
  items: IMenuItem[];
  handleRemove?: (index: IMenuItem) => void;
  handleSwapElement?: (currentIndex: number, newIndex: number) => void;
  emptyText: string;
  preventDelete?: boolean;
}

const MenuItems = ({
  items,
  handleRemove,
  handleSwapElement,
  emptyText,
  preventDelete = false,
}: IMenuItemsProps) => {
  return items && items.length > 0 ? (
    <ul>
      {items.map((item, index) => (
        <li
          key={index}
          className="mb-2 flex w-full flex-col border border-gray-400 p-4 shadow lg:flex-row lg:items-center"
        >
          <span className="flex-1">{item.name}</span>
          <span className="mt-2 flex w-full items-center justify-end lg:mt-0 lg:w-3/12">
            <span className="w-1/3 pr-1">
              <Button
                type="button"
                variant="secondary"
                size="medium"
                disabled={index === 0}
                onClick={() =>
                  handleSwapElement ? handleSwapElement(index, index - 1) : null
                }
              >
                <ChevronUp />
              </Button>
            </span>
            <span className="w-1/3 px-1">
              <Button
                type="button"
                variant="secondary"
                size="medium"
                disabled={index >= items.length - 1}
                onClick={() => handleSwapElement(index, index + 1)}
              >
                <ChevronDown />
              </Button>
            </span>
            {!preventDelete ? (
              <span className="w-1/3 pl-1">
                <Button
                  type="button"
                  variant="secondary"
                  size="medium"
                  onClick={() => (handleRemove ? handleRemove(item) : null)}
                >
                  <Close />
                </Button>
              </span>
            ) : null}
          </span>
        </li>
      ))}
    </ul>
  ) : (
    <p>{emptyText}</p>
  );
};

export default MenuItems;
