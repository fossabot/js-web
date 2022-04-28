import { each, trim } from 'lodash';

import API_PATHS from '../constants/apiPaths';
import useTranslation from '../i18n/useTranslation';
import { centralHttp } from '../http';
import { Gender, User, UserTitle } from '../models/user';
import { ProfileFormValue } from './profile.schema';
import { useState } from 'react';
import { getErrorMessages } from '../utils/error';
import { BaseResponseDto } from '../models/BaseResponse.dto';
import { CompanySizeRange } from '../models/range';
import { Industry } from '../models/industry';
import { useRouter } from 'next/router';
import { FormikHelpers } from 'formik';

export function useProfilePage() {
  const [errors, setErrors] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState<string>();
  const [isLoading, setLoading] = useState<boolean>();
  const { t } = useTranslation();
  const router = useRouter();
  const [user, setUser] = useState<User>(null);
  const [companySizeRanges, setCompanySizeRanges] = useState<
    CompanySizeRange[]
  >([]);
  const [industries, setIndustries] = useState<Industry[]>([]);

  interface UpdateProfileInfoDto {
    title: UserTitle | null;
    gender: Gender | null;
    firstName: string | null;
    lastName: string | null;
    dob: Date | null;
    dobVisible: boolean;
    lineId: string | null;
    lineIdVisible: boolean;
    jobTitle: string | null;
    department: string | null;
    companyName: string | null;
    companySizeRange: string | null;
    industry: string | null;
  }

  async function fetchUser() {
    const { data } = await centralHttp.get<BaseResponseDto<User>>(
      API_PATHS.PROFILE,
    );

    setUser(data.data);
  }

  async function fetchCompanySizeRanges() {
    const { data } = await centralHttp.get<BaseResponseDto<CompanySizeRange[]>>(
      API_PATHS.COMPANY_SIZE_RANGES,
      {
        params: {
          start: 'ASC',
          end: 'ASC',
        },
      },
    );

    setCompanySizeRanges(data.data);
  }

  async function fetchIndustries() {
    const { data } = await centralHttp.get<BaseResponseDto<Industry[]>>(
      API_PATHS.INDUSTRIES,
      {
        params: {
          nameEn: router.locale === 'en' ? 'ASC' : undefined,
          nameTh: router.locale === 'th' ? 'ASC' : undefined,
        },
      },
    );

    setIndustries(data.data);
  }

  async function handleSubmit(
    values: ProfileFormValue,
    helpers: FormikHelpers<ProfileFormValue>,
    apiPath?: string,
  ) {
    const { companySizeRange, industry, gender, title, email, ...rest } =
      values;
    const payload: UpdateProfileInfoDto = {
      ...rest,
      title: title || null,
      gender: gender || null,
      companySizeRange: companySizeRange?.id || null,
      industry: industry?.id || null,
    };
    each(payload, (value, key) => {
      if (typeof value === 'string') {
        payload[key] = trim(value);
      }
      if (value === '') {
        payload[key] = null;
      }
    });

    setLoading(true);
    try {
      await centralHttp.put(apiPath || API_PATHS.PROFILE, payload);
      setSuccessMessage(t('profilePage.saveSuccess'));
    } catch (error) {
      if (error?.response?.data?.code === 'DUPLICATE_PHONENUMBER') {
        setErrors([
          t('profilePage.duplicatePhoneNumber', {
            phoneNumber: values.phoneNumber,
          }),
        ]);
      } else {
        const errors = getErrorMessages(error);
        setErrors(errors);
      }
    }
    setLoading(false);
    window.scrollTo(0, 0);
  }

  function clearErrors() {
    setErrors([]);
  }

  function clearSuccessMessage() {
    setSuccessMessage('');
  }

  return {
    handleSubmit,
    errors,
    clearErrors,
    successMessage,
    clearSuccessMessage,
    isLoading,
    fetchUser,
    fetchIndustries,
    fetchCompanySizeRanges,
    user,
    industries,
    companySizeRanges,
  };
}
