import { Dispatch, FC, ReactNode } from 'react';
import DropdownButton from '../DropdownButton';
import ErrorMessages from '../ErrorMessage';
import ListSearch, { IListSearch } from '../ListSearch';

export interface IThreePaneTopPane {
  errors: string[];
  setErrors: Dispatch<string[]>;
  fieldOptions: IListSearch['fieldOptions'];
  sortOptions: IListSearch['sortOptions'];
  headingText: ReactNode;
  buttonName?: string;
  menuItems: {
    name: string;
    isDisabled?: boolean;
    action?: () => void;
    activeIcon: ReactNode;
    inactiveIcon: ReactNode;
  }[];
}

const ThreePaneTopPane: FC<IThreePaneTopPane> = ({
  errors,
  setErrors,
  fieldOptions,
  sortOptions,
  headingText,
  menuItems,
  buttonName = 'Actions',
}) => {
  return (
    <>
      <ErrorMessages messages={errors} onClearAction={() => setErrors([])} />
      <ListSearch fieldOptions={fieldOptions} defaultSearchField="name" />
      <ListSearch sortOptions={sortOptions} />
      <div className="flex items-center justify-between">
        <div className="px-2 py-2">
          <h2 className="mb-2 py-2 text-left text-xl font-bold text-black">
            {headingText}
          </h2>
        </div>
        <div className="flex flex-row space-x-4 px-2 py-2">
          <DropdownButton
            wrapperClassNames={'mx-1'}
            buttonName={buttonName}
            menuItems={menuItems}
          />
        </div>
      </div>
    </>
  );
};

export default ThreePaneTopPane;
