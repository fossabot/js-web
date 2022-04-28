import cx from 'classnames';
import Select, {
  components,
  GroupTypeBase,
  OptionTypeBase,
  SelectComponentsConfig,
  Styles,
} from 'react-select';
import AsyncSelect from 'react-select/async';
import resolveConfig from 'tailwindcss/resolveConfig';
import tailwindConfig from '../../tailwind.config';
import { ChevronDown, Close } from './icons';
import { useCallback, ClipboardEvent, KeyboardEvent, useRef } from 'react';
import useTranslation from '../i18n/useTranslation';

const { theme } = resolveConfig(tailwindConfig);

export interface IInputSelect<T = any> {
  formik?: any;
  error?: any;
  label?: string;
  name: string;
  value?: { label: any; value: any };
  options?: T[];
  promiseOptions?: any;
  onBlur?: (e: any) => void;
  onChange: (e: any) => void;
  onPaste?: (e: ClipboardEvent<HTMLDivElement>) => void;
  renderOptions?: ReadonlyArray<OptionTypeBase | GroupTypeBase<OptionTypeBase>>;
  description?: string;
  selectClassName?: string;
  selectClassWrapperName?: string;
  placeholder?: string;
  isClearable?: boolean;
  isSearchable?: boolean;
  isDisabled?: boolean;
  isLoading?: boolean;
  isMulti?: boolean;
  isAsync?: boolean;
  defaultValue?: any;
  overrideStyles?: Partial<Styles<any, boolean, GroupTypeBase<any>>>;
  closeMenuOnSelect?: boolean;
  maxMenuHeight?: number;
  paddingOverride?: string;
  filterOption?: (option: {
    label: string;
    value: string;
    data: { data: any };
  }) => boolean;
  onSplitValue?: (options: T[], value: string) => void;
  onEnterMultiValues?: (options: T[], inputValues: string[]) => void;
  components?: SelectComponentsConfig<unknown, any, any>;
}

const DELIMITER_REGEXP = /[,]|(\r\n|\r|\n)/gim;

const IndicatorsContainer = (props) => {
  return (
    <div className="">
      <components.IndicatorsContainer {...props}>
        {props.children}
      </components.IndicatorsContainer>
    </div>
  );
};

const ClearIndicator = (props) => {
  return (
    <components.ClearIndicator {...props}>
      <Close
        className={cx('h-5 w-5 text-gray-600', {
          hidden: !props.selectProps.menuIsOpen,
        })}
        aria-hidden="true"
      />
    </components.ClearIndicator>
  );
};

const Option = (props) => {
  return (
    <components.Option {...props}>
      <div className="py-2 px-3 hover:bg-maroon-100 hover:text-maroon-400">
        {props.children}
      </div>
    </components.Option>
  );
};

const InputSelect = (props: IInputSelect) => {
  const {
    formik,
    name,
    error,
    label,
    selectClassWrapperName,
    selectClassName,
    description,
    options,
    value,
    overrideStyles,
    closeMenuOnSelect,
    filterOption,
    onSplitValue,
    onEnterMultiValues,
  } = props;

  const { t } = useTranslation();

  const selectRef = useRef(null);

  const customStyles: Partial<Styles<any, boolean, GroupTypeBase<any>>> = {
    ...overrideStyles,
    option: (base, state) => ({
      ...base,
      borderRadius: theme.borderRadius['lg'],
      color: theme.colors.black,
      backgroundColor: theme.colors.white,
      position: 'relative',
      '&::after': {
        ...(state.isSelected && {
          position: 'absolute',
          right: theme.inset['4'],
          top: theme.inset['4'],
          // TODO Change to checked svg
          content: theme.backgroundImage['checked-dropdown'],
        }),
      },
      textAlign: 'left',
      height: '100%',
      '&:active': {
        backgroundColor: theme.colors.transparent,
      },
      ...overrideStyles?.option?.(base, state),
    }),
    control: (base, state) => ({
      ...base,
      borderRadius: theme.borderRadius['lg'],
      // Solution for uneven size of select box
      padding:
        state.hasValue && !props.isSearchable
          ? `${theme.padding['1.5']} ${theme.padding['1']}`
          : props.isSearchable
          ? props.paddingOverride
            ? props.paddingOverride
            : `${theme.padding['0.5']} ${theme.padding['1']}`
          : `${theme.padding['1.5']} ${theme.padding['1']}`,
      opacity: state.isDisabled && theme.opacity['50'],
      borderColor: error
        ? theme.colors.red['200']
        : state.isFocused
        ? theme.colors.gray['500']
        : theme.colors.gray['300'],
      '&:active, &:hover': {
        borderColor: error
          ? theme.colors.red['200']
          : state.isFocused
          ? theme.colors.gray['500']
          : theme.colors.gray['300'],
      },
      fontSize: theme.inset['4'],
      lineHeight: theme.inset['7'],
      boxShadow: `none`,
      // Solution for jiggling animation when select state changed from none to value
      transition: 'none',
      '::-webkit-scrollbar': {
        width: theme.inset['2'],
      },
      '::-webkit-scrollbar-track': {
        background: theme.colors.transparent,
      },
      '::-webkit-scrollbar-thumb': {
        background: theme.colors.gray['500'],
        borderRadius: theme.inset['4'],
        height: theme.height['8'],
      },
      '::-webkit-scrollbar-thumb:hover': {
        background: theme.colors.gray['600'],
      },
      ...overrideStyles?.control?.(base, state),
    }),
    placeholder: (base, state) => ({
      ...base,
      color: theme.colors.gray['400'],
      fontSize: theme.inset['4'],
      lineHeight: theme.inset['7'],
      ...overrideStyles?.placeholder?.(base, state),
    }),
    menuList: (base, state) => ({
      ...base,
      '::-webkit-scrollbar': {
        width: theme.inset['2'],
      },
      '::-webkit-scrollbar-track': {
        background: theme.colors.transparent,
      },
      '::-webkit-scrollbar-thumb': {
        background: theme.colors.gray['500'],
        borderRadius: theme.inset['4'],
        height: theme.height['8'],
      },
      '::-webkit-scrollbar-thumb:hover': {
        background: theme.colors.gray['600'],
      },
      ...overrideStyles?.menuList?.(base, state),
    }),
  };

  const onSelectOption = useCallback(
    (option) => {
      if (props.isMulti) {
        props.onChange({
          target: { value: option.map((item) => item.value), name },
        });
      } else {
        props.onChange({ target: { value: option?.value, name } });
      }
    },
    [name, props.isMulti, props.onChange],
  );

  const DropdownIndicator = useCallback(
    (props) => {
      return (
        <components.DropdownIndicator {...props}>
          <ChevronDown
            className={cx('h-5 w-5', {
              'text-red-200': error,
              'text-gray-600': !error,
              'invisible opacity-0':
                props.selectProps.menuIsOpen && !props.hasValue,
              'h-5 w-px': props.selectProps.menuIsOpen && props.hasValue,
            })}
            aria-hidden="true"
          />
        </components.DropdownIndicator>
      );
    },
    [error],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLElement>) => {
      if (e.key === 'Enter' && !!onEnterMultiValues) {
        const input = e.target as HTMLInputElement;

        if (onEnterMultiValues && DELIMITER_REGEXP.test(input.value)) {
          const inputValues = input.value
            .replace(DELIMITER_REGEXP, ',')
            .split(',')
            .map((val) => val?.trim())
            .filter((val) => !!val);

          onEnterMultiValues(options, inputValues);

          selectRef.current.select.select.blur();
          e.preventDefault();
        }
      } else if (e.key === ',' && !!onSplitValue) {
        const input = e.target as HTMLInputElement;
        const inputValues = input.value.replace(',', '').trim();

        onSplitValue(options, inputValues);

        selectRef.current.select.select.blur();
        e.preventDefault();
        selectRef.current.select.select.focus();
      }
    },
    [onSplitValue, onEnterMultiValues, options],
  );

  const renderSelect = () => {
    if (props.isAsync) {
      return (
        <AsyncSelect
          id={name}
          ref={selectRef}
          {...props}
          value={value}
          instanceId={name}
          inputId={name}
          components={{
            Option,
            DropdownIndicator,
            IndicatorsContainer,
            ClearIndicator,
            ...props.components,
          }}
          styles={{
            ...customStyles,
            indicatorSeparator: () => null, // removes the "stick"
          }}
          hideSelectedOptions={false}
          onChange={onSelectOption}
          placeholder={props.placeholder}
          defaultValue={props.defaultValue}
          isDisabled={props.isDisabled}
          isLoading={props.isLoading}
          isClearable={props.isClearable}
          isSearchable={props.isSearchable ?? false}
          isMulti={props.isMulti}
          className={cx('w-full', selectClassName)}
          openMenuOnFocus={true}
          defaultOptions
          loadOptions={props.promiseOptions}
          onMenuClose={() => formik && formik.setFieldTouched(name, true)}
          closeMenuOnSelect={closeMenuOnSelect}
          filterOption={filterOption}
          onKeyDown={
            onEnterMultiValues || onSplitValue ? handleKeyDown : undefined
          }
        />
      );
    } else {
      const label_options =
        !props.renderOptions && options.map((o) => ({ label: o, value: o }));
      return (
        <Select
          id={name}
          ref={selectRef}
          value={value}
          instanceId={name}
          inputId={name}
          components={{
            Option,
            DropdownIndicator,
            IndicatorsContainer,
            ClearIndicator,
          }}
          styles={{
            ...customStyles,
            indicatorSeparator: () => null, // removes the "stick"
          }}
          hideSelectedOptions={false}
          onChange={onSelectOption}
          placeholder={props.placeholder}
          defaultValue={props.defaultValue}
          isDisabled={props.isDisabled}
          isLoading={props.isLoading}
          isClearable={props.isClearable}
          isSearchable={props.isSearchable ?? false}
          isMulti={props.isMulti}
          className={cx('w-full', selectClassName)}
          openMenuOnFocus={true}
          onMenuClose={() => formik && formik.setFieldTouched(name, true)}
          options={props.renderOptions ? props.renderOptions : label_options}
          closeMenuOnSelect={closeMenuOnSelect}
          maxMenuHeight={props.maxMenuHeight}
          filterOption={filterOption}
        />
      );
    }
  };

  return (
    <div
      className={cx('flex w-full flex-col items-start', selectClassWrapperName)}
      onPaste={props.onPaste}
    >
      {label ? (
        <label htmlFor={name} className="mb-2 text-caption font-semibold">
          {label}
        </label>
      ) : null}

      {renderSelect()}

      {error && <p className="pt-2 text-footnote text-red-200">{t(error)}</p>}
      {description && !error ? (
        <p className="pt-2 text-footnote">{description}</p>
      ) : null}
    </div>
  );
};

export default InputSelect;
