import { FC } from 'react';
import InputSection, { IInputSection } from './InputSection';
import InputSelect, { IInputSelect } from './InputSelect';
import cx from 'classnames';
import useTranslation from '../i18n/useTranslation';

export interface IInputSectionWithSelect {
  inputSelectProps: IInputSelect;
  inputSectionProps: IInputSection;
  dropdownDirection?: 'left' | 'right';
  dropdownNoShrink?: boolean;
}

export const InputSectionWithSelect: FC<IInputSectionWithSelect> = (props) => {
  const { t } = useTranslation();
  const {
    inputSectionProps,
    inputSelectProps,
    dropdownDirection = 'left',
    dropdownNoShrink = false,
  } = props;
  const { error: sectionError, ...restInputSectionProps } = inputSectionProps;
  const { error: selectError, ...resetInputSelectProps } = inputSelectProps;
  const errorMsg = sectionError || selectError;
  const dropdown = (
    <div
      className={cx('w-1/2 border-gray-300', {
        'border-r': dropdownDirection === 'left',
        'border-l': dropdownDirection === 'right',
        'flex-shrink-0': dropdownNoShrink,
      })}
    >
      <InputSelect
        overrideStyles={{ control: () => ({ borderWidth: 0 }) }}
        {...resetInputSelectProps}
      />
    </div>
  );

  return (
    <>
      <div className="flex items-center rounded-lg border border-gray-300">
        {dropdownDirection === 'left' && dropdown}
        <InputSection
          {...restInputSectionProps}
          inputClassName="border-none"
          error={undefined}
        />
        {dropdownDirection === 'right' && dropdown}
      </div>
      {errorMsg && (
        <p className="pt-2 text-footnote text-red-200">{t(errorMsg)}</p>
      )}
    </>
  );
};
