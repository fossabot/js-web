import cx from 'classnames';
import { format, setHours, setMinutes, startOfDay } from 'date-fns';
import { useEffect, useState } from 'react';
import { usePopper } from 'react-popper';
import { ChevronDown } from '../icons';

const hourOptions: { label: string; value: string }[] = [];
const minuteOptions: { label: string; value: string }[] = [];

for (let i = 0; i < 24; i++) {
  hourOptions.push({ label: String(i).padStart(2, '0'), value: String(i) });
}
for (let i = 0; i < 60; i++) {
  minuteOptions.push({ label: String(i).padStart(2, '0'), value: String(i) });
}

interface IDatePickerSelect {
  date: Date;
  onChange: (date: Date) => void;
  type: 'hour' | 'minute';
}

export const DatePickerSelect = ({
  date,
  onChange,
  type,
}: IDatePickerSelect) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [referenceElement, setReferenceElement] = useState(null);
  const [popperElement, setPopperElement] = useState(null);
  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement: 'bottom',
  });

  useEffect(() => {
    function mouseDownListener(e: MouseEvent) {
      if (popperElement && !popperElement.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    if (isMenuOpen) {
      document.addEventListener('mousedown', mouseDownListener);
    }

    return () => {
      document.removeEventListener('mousedown', mouseDownListener);
    };
  }, [isMenuOpen, popperElement]);

  return (
    <>
      <a
        ref={setReferenceElement}
        role="button"
        className="flex w-22 min-w-0 items-center justify-between  rounded-lg border border-gray-300 bg-white py-2 px-4"
        onClick={() => {
          setIsMenuOpen(true);
        }}
      >
        <span>
          {date
            ? format(date, type === 'hour' ? 'HH' : 'mm')
            : type === 'hour'
            ? 'HH'
            : 'MM'}
        </span>
        <ChevronDown />
      </a>
      {isMenuOpen && (
        <div
          ref={setPopperElement}
          style={{
            ...styles.popper,
            width: referenceElement?.clientWidth,
          }}
          {...attributes.popper}
          className={cx(
            'z-60 max-h-28 overflow-y-auto rounded-lg bg-white shadow-sm',
          )}
        >
          {(type === 'hour' ? hourOptions : minuteOptions).map((option) => (
            <a
              className="block py-2 px-4"
              key={option.value}
              onClick={() => {
                const setter = type === 'hour' ? setHours : setMinutes;

                onChange(setter(date || startOfDay(new Date()), +option.value));
                setIsMenuOpen(false);
              }}
            >
              {option.label}
            </a>
          ))}
        </div>
      )}
    </>
  );
};
