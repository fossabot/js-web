import cx from 'classnames';
import { CSSProperties, ReactNode, useState, useEffect } from 'react';
import useSort from '../hooks/useSort';
import tailwindConfig from '../../tailwind.config';
import { ChevronDown, SortArrowDown, SortArrowUp } from './icons';
import resolveConfig from 'tailwindcss/resolveConfig';
import { usePopper } from 'react-popper';
import { createPortal } from 'react-dom';

export enum DataTableColumnSize {
  DEFAULT = 'w-44',
  MIN = 'w-min',
  MAX = 'w-full',
  CHECKBOX = 'w-10',
  SHORT = 'w-36',
  SHORTER = 'w-24',
  LONG = 'w-56',
  LONGER = 'w-64',
}

export enum DataTableAlignment {
  LEFT,
  RIGHT,
  CENTER,
}

const { theme } = resolveConfig(tailwindConfig);

// border does not show up properly for sticky table cells, hence we use box-shadow
// https://stackoverflow.com/a/57170489
export const stickyBorderShadow: CSSProperties = {
  boxShadow: `inset -1px 0 0 ${theme.borderColor.gray['200']}`,
};

export interface IDataTable {
  children: React.ReactNode;
  containerClassName?: string;
  tableClassName?: string;
}

export function DataTable({
  children,
  containerClassName,
  tableClassName,
}: IDataTable) {
  return (
    <div className={cx('relative', containerClassName)}>
      <div className="static min-w-0 overflow-x-auto">
        <table className={cx('w-full table-fixed', tableClassName)}>
          {children}
        </table>
      </div>
    </div>
  );
}

export interface IDataTableHeadRow {
  children: React.ReactNode;
  className?: string;
}

export function DataTableHeadRow({ children, className }: IDataTableHeadRow) {
  return <tr className={cx('bg-gray-100', className)}>{children}</tr>;
}

export interface IDataTableHeadColumn {
  className?: string;
  align?: DataTableAlignment;
  size?: DataTableColumnSize;
  children: React.ReactNode;
  style?: CSSProperties;

  /**
   * Order field.
   */
  orderBy?: string;
}

export function DataTableHeadColumn({
  children,
  className,
  orderBy,
  size = DataTableColumnSize.DEFAULT,
  align = DataTableAlignment.LEFT,
  style,
}: IDataTableHeadColumn) {
  const { setSortQuery, orderBy: queryOrderBy, order } = useSort();

  function handleClickHeadColumn() {
    if (!orderBy) return;

    const newOrder = order === 'ASC' ? 'DESC' : 'ASC';
    setSortQuery({
      orderBy,
      order: newOrder,
    });
  }

  return (
    <th
      className={cx(
        'select-none p-3 text-caption font-bold text-gray-600',
        {
          'cursor-pointer': !!orderBy,
        },
        size,
        className,
      )}
      onClick={handleClickHeadColumn}
      style={style}
    >
      <div className="flex w-full items-center justify-between text-gray-400">
        <span
          className={cx('w-full text-gray-650', {
            'text-left': align === DataTableAlignment.LEFT,
            'text-right': align === DataTableAlignment.RIGHT,
            'text-center': align === DataTableAlignment.CENTER,
          })}
        >
          {children || null}
        </span>
        {!!orderBy && (
          <div className="flex flex-col items-center space-y-0.5">
            <SortArrowUp
              className={cx({
                'text-gray-650': queryOrderBy === orderBy && order === 'ASC',
                'text-gray-400': queryOrderBy === orderBy && order !== 'ASC',
              })}
            />
            <SortArrowDown
              className={cx({
                'text-gray-650': queryOrderBy === orderBy && order === 'DESC',
                'text-gray-400': queryOrderBy === orderBy && order !== 'DESC',
              })}
            />
          </div>
        )}
      </div>
    </th>
  );
}

export interface IDataTableRow {
  children: React.ReactNode;
  className?: string;
}

export function DataTableRow({ children, className }: IDataTableRow) {
  return (
    <tr className={cx('border-b border-gray-200 text-caption', className)}>
      {children}
    </tr>
  );
}

export interface IDataTableColumn {
  className?: string;
  align?: DataTableAlignment;
  children?: React.ReactNode;
  optional?: boolean;
  title?: string;
  style?: CSSProperties;
}

export function DataTableColumn({
  children,
  align,
  className,
  optional = false,
  title,
  style,
}: IDataTableColumn) {
  return (
    <td
      title={title}
      className={cx(
        'p-3 text-caption text-black',
        {
          'text-left': align === DataTableAlignment.LEFT,
          'text-right': align === DataTableAlignment.RIGHT,
          'text-center': align === DataTableAlignment.CENTER,
          'text-gray-500': optional,
          'text-black': !optional,
        },
        className,
      )}
      style={style}
    >
      {children || null}
    </td>
  );
}

export interface IDataTableSelectOption {
  label: string;
  value: any;
  className?: string;
  icon?: ReactNode;
}

export interface IDataTableSelect {
  options: IDataTableSelectOption[];
  value: IDataTableSelectOption;
  isDisabled?: boolean;
  onChange: (value: any) => void;
}

export function DataTableSelect({
  options,
  value,
  isDisabled,
  onChange,
}: IDataTableSelect) {
  const [showMenu, setShowMenu] = useState(false);
  const [refElement, setRefElement] = useState(null);
  const [popperElement, setPopperElement] = useState(null);
  const {
    styles,
    attributes,
    update: updatePopper,
  } = usePopper(refElement, popperElement, {
    modifiers: [
      { name: 'offset', options: { offset: [-16, 12] } },
      { name: 'flip', options: { fallbackPlacements: ['bottom'] } },
    ],
  });

  function handleClickItem(option: IDataTableSelectOption) {
    if (value.value !== option.value) {
      onChange(option.value);
    }
    setShowMenu(false);
  }

  function handleClickContainer() {
    setShowMenu(true);
    updatePopper();
  }

  function handleOptionBlur() {
    setShowMenu(false);
  }

  useEffect(() => {
    if (showMenu) {
      // For maintain scroll position after focus.
      const x = window.scrollX,
        y = window.scrollY;
      popperElement.focus();
      window.scrollTo(x, y);
    }
  }, [showMenu]);

  return (
    <>
      <div
        className={cx('select-none', {
          'pointer-events-none opacity-50': isDisabled,
        })}
        ref={setRefElement}
        onClick={handleClickContainer}
      >
        <div
          className={cx(
            'flex w-full cursor-pointer items-center',
            value.className,
          )}
        >
          {!!value && (
            <>
              {!!value.icon ? <div className="mr-1.5">{value.icon}</div> : null}
              <span className="mr-4 text-caption font-semibold">
                {value.label}
              </span>
              <ChevronDown className="ml-auto h-4 w-4 flex-shrink-0 text-black" />
            </>
          )}
        </div>
      </div>
      {createPortal(
        <div
          className={cx(
            'outline-none box-content border border-gray-200 bg-white p-2 shadow',
            {
              block: showMenu,
              hidden: !showMenu,
            },
          )}
          ref={setPopperElement}
          style={styles.popper}
          {...attributes.popper}
          onBlur={handleOptionBlur}
          tabIndex={0}
        >
          {options?.map((option, index) => (
            <div
              key={index}
              className={cx(
                'flex cursor-pointer items-center py-2 px-2 hover:bg-blue-100',
                option.className,
              )}
              onClick={() => handleClickItem(option)}
            >
              {!!option.icon ? (
                <div className="mr-1.5">{option.icon}</div>
              ) : null}
              <span className="text-caption font-semibold">{option.label}</span>
            </div>
          ))}
        </div>,
        document.body,
      )}
    </>
  );
}
