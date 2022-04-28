import cx from 'classnames';

export default function LoadEmpty({
  imageSrc,
  msg,
  hasFilters,
  onClear,
  className,
  textColorClassName,
  filterClearText,
}: {
  className?: string;
  imageSrc: string;
  msg: string;
  hasFilters?: boolean;
  onClear?: () => void;
  textColorClassName?: string;
  filterClearText?: string;
}) {
  return (
    <div className="flex flex-col items-center lg:mt-32">
      <img src={imageSrc} className={cx('mb-4', className)} />
      <div
        className={cx('text-subheading font-bold', {
          [textColorClassName]: !!textColorClassName,
          'text-gray-400': !textColorClassName,
        })}
      >
        {msg}
      </div>
      {hasFilters && (
        <a
          role="button"
          onClick={onClear}
          className="mt-3 font-semibold text-brand-primary"
        >
          {filterClearText}
        </a>
      )}
    </div>
  );
}
