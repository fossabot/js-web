import { Fragment } from 'react';
import { FaChevronDown } from 'react-icons/fa';
import { Menu, Transition } from '@headlessui/react';

export default function DropdownButton({
  wrapperClassNames,
  buttonName,
  menuItems,
}) {
  return (
    <div className={wrapperClassNames}>
      <Menu as="div" className="relative inline-block h-full w-full text-left">
        <Menu.Button className="outline-none focus:outline-none inline-flex h-full w-full cursor-pointer items-center justify-center rounded bg-white py-2 px-4 font-bold text-black shadow-lg focus:ring">
          {buttonName}
          <FaChevronDown
            className="text-violet-200 hover:text-violet-100 ml-2 -mr-1 h-5 w-5"
            aria-hidden="true"
          />
        </Menu.Button>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="focus:outline-none absolute right-0 z-10 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
            <div className="px-1 py-1 ">
              {menuItems.map((mi) => {
                return (
                  <Menu.Item key={mi.name}>
                    {({ active }) => (
                      <button
                        disabled={mi.isDisabled}
                        onClick={mi.action}
                        className={`${
                          active && !mi.isDisabled
                            ? 'text-black'
                            : 'text-gray-600'
                        } group flex w-full items-center rounded-md px-2 py-2 text-sm disabled:opacity-50`}
                      >
                        {active && !mi.isDisabled
                          ? mi.activeIcon
                          : mi.inactiveIcon}
                        {mi.name}
                      </button>
                    )}
                  </Menu.Item>
                );
              })}
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  );
}
