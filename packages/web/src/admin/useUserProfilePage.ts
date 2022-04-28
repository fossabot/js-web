import { FormikHelpers } from 'formik';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { ProfileFormValue } from '../account/profile.schema';
import API_PATHS from '../constants/apiPaths';
import { centralHttp } from '../http';
import { BaseResponseDto } from '../models/BaseResponse.dto';
import { User } from '../models/user';

export function useUserProfilePage() {
  const router = useRouter();
  const { id } = router.query;
  const [user, setUser] = useState<User>();

  async function fetchUser() {
    const { data } = await centralHttp.get<BaseResponseDto<User>>(
      API_PATHS.PROFILE_ID.replace(':id', id as string),
    );

    setUser(data.data);
  }

  function updateProfile(
    onSubmit: (
      values: ProfileFormValue,
      helpers: FormikHelpers<ProfileFormValue>,
      apiPath?: string,
    ) => any,
  ) {
    return (
      values: ProfileFormValue,
      helpers: FormikHelpers<ProfileFormValue>,
    ) => {
      return onSubmit(
        values,
        helpers,
        API_PATHS.PROFILE_ID.replace(':id', id as string),
      );
    };
  }

  return {
    fetchUser,
    updateProfile,
    user,
  };
}
