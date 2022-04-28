import React, { FC, ReactNode, useMemo } from 'react';
import useTranslation from '../i18n/useTranslation';
import { Industry } from '../models/industry';
import { CompanySizeRange } from '../models/range';
import InputSection from '../ui-kit/InputSection';
import InputSelect from '../ui-kit/InputSelect';
import { find } from 'lodash';
import cx from 'classnames';
import { useField } from 'formik';
import { DEFAULT_ROLES } from '../constants/roles';

export interface IProfessional {
  fieldNames: {
    jobTitle: string;
    department: string;
    companyName: string;
    companySize: string;
    industry: string;
  };
  roles: string[];
  companySizeOptions: { label: ReactNode; value: CompanySizeRange }[];
  industryOptions: { label: ReactNode; value: Industry }[];
}

export const Professional: FC<IProfessional> = (props) => {
  const { fieldNames, companySizeOptions, industryOptions } = props;
  const { t } = useTranslation();
  const [fieldInputJobTitle] = useField(fieldNames.jobTitle);
  const [fieldInputDepartment] = useField(fieldNames.department);
  const [fieldInputCompanyName] = useField(fieldNames.companyName);
  const [fieldInputCompanySize] = useField(fieldNames.companySize);
  const [fieldInputIndustry] = useField(fieldNames.industry);
  const isInstructor = useMemo(
    () => props.roles.some((r) => r === DEFAULT_ROLES.INSTRUCTOR),
    [props.roles],
  );

  return (
    <section>
      <header className="mb-8 text-subheading font-bold">
        {t('profilePage.professionalInfo')}
      </header>
      <div className="space-y-6 lg:space-y-8">
        <div className="space-y-6 lg:flex lg:space-x-6 lg:space-y-0">
          <label className="block flex-1 space-y-2">
            <div className="text-caption font-semibold">
              {t('profilePage.currentJobTitle')}
            </div>
            <InputSection
              {...fieldInputJobTitle}
              placeholder={t('profilePage.currentJobTitlePlaceholder')}
            />
          </label>
          <label
            className={cx('flex-1 space-y-2', {
              hidden: isInstructor,
              block: !isInstructor,
            })}
          >
            <div className="text-caption font-semibold">
              {t('profilePage.department')}
            </div>
            <InputSection
              {...fieldInputDepartment}
              placeholder={t('profilePage.departmentPlaceholder')}
            />
          </label>
        </div>
        <div className="space-y-6 lg:flex lg:space-x-6 lg:space-y-0">
          <label className="block flex-1 space-y-2">
            <div className="text-caption font-semibold">
              {t('profilePage.companyName')}
            </div>
            <InputSection
              {...fieldInputCompanyName}
              placeholder={t('profilePage.companyNamePlaceholder')}
            />
          </label>
          <label
            className={cx('flex-1 space-y-2', {
              hidden: isInstructor,
              block: !isInstructor,
            })}
          >
            <div className="text-caption font-semibold">
              {t('profilePage.companySize')}
            </div>
            <InputSelect
              {...fieldInputCompanySize}
              value={find(companySizeOptions, {
                value: fieldInputCompanySize.value,
              })}
              options={[]}
              renderOptions={companySizeOptions}
              isClearable
            />
          </label>
        </div>
        <div className="space-y-6 lg:flex lg:space-x-6 lg:space-y-0">
          <label
            className={cx('flex-1 space-y-2', {
              hidden: isInstructor,
              block: !isInstructor,
            })}
          >
            <div className="text-caption font-semibold">
              {t('profilePage.industry')}
            </div>
            <InputSelect
              {...fieldInputIndustry}
              value={find(industryOptions, { value: fieldInputIndustry.value })}
              options={[]}
              renderOptions={industryOptions}
              isClearable
            />
          </label>
        </div>
      </div>
    </section>
  );
};
