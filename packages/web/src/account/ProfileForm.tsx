import { FC, ReactNode, useMemo, useState } from 'react';
import { Formik, FormikConfig } from 'formik';
import { defaultTo } from 'lodash';

import { Personal } from './Personal';
import { Professional } from './Professional';
import { Gender, User, UserTitle } from '../models/user';
import { ProfileFormValue, profileFormSchema } from './profile.schema';
import Button from '../ui-kit/Button';
import useTranslation from '../i18n/useTranslation';
import { CompanySizeRange } from '../models/range';
import { Industry } from '../models/industry';
import { useLocaleText } from '../i18n/useLocaleText';
import { Instructor } from './Instructor';
import { DEFAULT_ROLES } from '../constants/roles';

export interface IProfileForm {
  user: User;
  companySizeRanges: CompanySizeRange[];
  industries: Industry[];
  loading?: boolean;
  onSubmit: FormikConfig<ProfileFormValue>['onSubmit'];
  errorComponent?: ReactNode;
  successComponent?: ReactNode;
  hideAvatarSection?: boolean;
}

export const ProfileForm: FC<IProfileForm> = (props) => {
  const {
    user,
    onSubmit,
    companySizeRanges,
    industries,
    errorComponent,
    successComponent,
    loading,
    hideAvatarSection,
  } = props;
  const { t } = useTranslation();
  const localeText = useLocaleText();
  const companySizeRangeOptions = companySizeRanges.map((range) => ({
    label: localeText(range),
    value: range,
  }));
  const industryOptions = industries.map((industry) => ({
    label: localeText(industry),
    value: industry,
  }));
  const isInstructor = useMemo(
    () => user.roles.some((r) => r === DEFAULT_ROLES.INSTRUCTOR),
    [user.roles],
  );

  const [markdownCharCount, setMarkdownCharCount] = useState<
    Record<string, number>
  >({});

  return (
    <Formik<ProfileFormValue>
      initialValues={{
        email: user.email,
        phoneNumber: defaultTo(user.phoneNumber, ''),
        title: user.title,
        gender: user.gender,
        firstName: user.firstName,
        lastName: user.lastName,
        dob: user.dob ? new Date(user.dob) : null,
        dobVisible: user.dobVisible,
        lineId: defaultTo(user.lineId, ''),
        lineIdVisible: user.lineIdVisible,
        jobTitle: defaultTo(user.jobTitle, ''),
        department: defaultTo(user.department, ''),
        companyName: defaultTo(user.companyName, ''),
        companySizeRange: user.companySizeRange,
        industry: user.industry,
        bio: user.bio,
        experience: user.experience,
        shortSummary: defaultTo(user.shortSummary, ''),
      }}
      onSubmit={onSubmit}
      validationSchema={profileFormSchema}
      enableReinitialize
    >
      {(formik) => (
        <form
          onSubmit={(e) => {
            if (
              Object.keys(markdownCharCount).some(
                (key) => markdownCharCount[key] > 600,
              )
            ) {
              e.preventDefault();
              return;
            }
            formik.handleSubmit(e);
          }}
          className="lg:mx-auto lg:w-100 lg:px-10"
        >
          {errorComponent}
          {successComponent}
          <Personal
            hideAvatarSection={hideAvatarSection}
            fieldNames={{
              email: 'email',
              phoneNumber: 'phoneNumber',
              title: 'title',
              gender: 'gender',
              firstName: 'firstName',
              lastName: 'lastName',
              dob: 'dob',
              dobVisible: 'dobVisible',
              lineId: 'lineId',
              lineIdVisible: 'lineIdVisible',
            }}
            userTitleOptions={[
              { label: t('userTitle.mr'), value: UserTitle.Mr },
              { label: t('userTitle.mrs'), value: UserTitle.Mrs },
              { label: t('userTitle.ms'), value: UserTitle.Ms },
              { label: t('userTitle.khun'), value: UserTitle.Khun },
            ]}
            genderOptions={[
              { label: t('gender.male'), value: Gender.Male },
              { label: t('gender.female'), value: Gender.Female },
              { label: t('gender.other'), value: Gender.Other },
            ]}
          />
          <hr className="my-8 border-gray-200" />
          <Professional
            fieldNames={{
              jobTitle: 'jobTitle',
              department: 'department',
              companyName: 'companyName',
              companySize: 'companySizeRange',
              industry: 'industry',
            }}
            companySizeOptions={companySizeRangeOptions}
            industryOptions={industryOptions}
            roles={user.roles}
          />
          {isInstructor && <hr className="my-8 border-gray-200" />}
          <Instructor
            fieldNames={{
              bio: 'bio',
              shortSummary: 'shortSummary',
              experience: 'experience',
            }}
            isInstructor={isInstructor}
            id={user.id}
            updateCharacterCount={(fieldName, count) => {
              const charCount = { ...markdownCharCount, [fieldName]: count };
              setMarkdownCharCount(charCount);
            }}
          />
          <section className="sticky bottom-0 bg-white py-4 lg:static lg:flex lg:justify-end lg:bg-none lg:py-8">
            <Button
              variant="primary"
              type="submit"
              size="medium"
              className="font-semibold lg:w-40"
              isLoading={loading}
            >
              {t('profilePage.saveChanges')}
            </Button>
          </section>
        </form>
      )}
    </Formik>
  );
};
