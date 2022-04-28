import cx from 'classnames';

export const TableHead = (props) => {
  return (
    <th
      className={cx(
        'text-grey-dark border-b py-4 px-6 text-sm font-bold uppercase',
        props.className,
      )}
    >
      {props.children}
    </th>
  );
};

export const TableColumn = (props) => {
  return (
    <td
      className={cx('border-b py-4 px-6', props.className)}
      colSpan={props.colSpan}
    >
      {props.children}
    </td>
  );
};
