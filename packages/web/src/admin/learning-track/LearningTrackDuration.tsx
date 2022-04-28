import { ChangeEvent, FC } from 'react';
import { FieldInputProps } from 'formik';

import InputSection from '../../ui-kit/InputSection';
import useTranslation from '../../i18n/useTranslation';

export interface ILearningTrackDuration {
  fieldMonths: FieldInputProps<number>;
  fieldWeeks: FieldInputProps<number>;
  fieldDays: FieldInputProps<number>;
  fieldHours: FieldInputProps<number>;
  fieldMinutes: FieldInputProps<number>;
}

export const LearningTrackDuration: FC<ILearningTrackDuration> = (props) => {
  const { fieldMinutes, fieldHours, fieldDays, fieldWeeks, fieldMonths } =
    props;
  const { t } = useTranslation();

  function handleInputNumberChange(field: FieldInputProps<number>) {
    return (evt: ChangeEvent<{ value: number | string }>) => {
      evt.target.value = +evt.target.value;
      field.onChange(evt);
    };
  }

  return (
    <div>
      <div className="mb-2 text-left text-caption font-bold">
        {t('learningTrackForm.durationValue') + ' *'}
      </div>
      <div className="mb-3 flex w-1/4 flex-row items-center space-x-4">
        <InputSection
          type="number"
          min={0}
          max={12}
          name={fieldMonths.name}
          placeholder={t('learningTrackForm.durationMonth')}
          inputWrapperClassName="mr-1"
          inputClassName="h-51px"
          value={fieldMonths.value}
          onChange={handleInputNumberChange(fieldMonths)}
        />
        <div className="w-1/2 text-left text-caption font-bold">
          {t('learningTrackForm.durationMonth')}
        </div>
      </div>
      <div className="mb-3 flex w-1/4 flex-row items-center space-x-4">
        <InputSection
          type="number"
          min={0}
          max={52}
          name={fieldWeeks.name}
          placeholder={t('learningTrackForm.durationWeek')}
          inputWrapperClassName="mr-1"
          inputClassName="h-51px"
          value={fieldWeeks.value}
          onChange={handleInputNumberChange(fieldWeeks)}
        />
        <div className="w-1/2 text-left text-caption font-bold">
          {t('learningTrackForm.durationWeek')}
        </div>
      </div>
      <div className="mb-3 flex w-1/4 flex-row items-center space-x-4">
        <InputSection
          type="number"
          min={0}
          max={365}
          name={fieldDays.name}
          placeholder={t('learningTrackForm.durationDay')}
          inputWrapperClassName="mr-1"
          inputClassName="h-51px"
          value={fieldDays.value}
          onChange={handleInputNumberChange(fieldDays)}
        />
        <div className="w-1/2 text-left text-caption font-bold">
          {t('learningTrackForm.durationDay')}
        </div>
      </div>
      <div className="mb-3 flex w-1/4 flex-row items-center space-x-4">
        <InputSection
          type="number"
          min={0}
          max={23}
          name={fieldHours.name}
          placeholder={t('learningTrackForm.durationHour')}
          inputWrapperClassName="mr-1"
          inputClassName="h-51px"
          value={fieldHours.value}
          onChange={handleInputNumberChange(fieldHours)}
        />
        <div className="w-1/2 text-left text-caption font-bold">
          {t('learningTrackForm.durationHour')}
        </div>
      </div>
      <div className="mb-3 flex w-1/4 flex-row items-center space-x-4">
        <InputSection
          type="number"
          min={0}
          max={59}
          name={fieldMinutes.name}
          placeholder={t('learningTrackForm.durationMinute')}
          inputWrapperClassName="mr-1"
          inputClassName="h-51px"
          value={fieldMinutes.value}
          onChange={handleInputNumberChange(fieldMinutes)}
        />
        <div className="w-1/2 text-left text-caption font-bold">
          {t('learningTrackForm.durationMinute')}
        </div>
      </div>
    </div>
  );
};
