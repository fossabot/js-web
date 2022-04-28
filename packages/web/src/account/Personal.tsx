import { useField } from 'formik';
import React, { FC, ReactNode, useEffect, useState } from 'react';
import useTranslation from '../i18n/useTranslation';
import { Gender, User, UserTitle } from '../models/user';
import CheckBox from '../ui-kit/CheckBox';
import InputSection from '../ui-kit/InputSection';
import InputSelect from '../ui-kit/InputSelect';
import { DatePicker } from '../ui-kit/lib/Datepicker';
import { find } from 'lodash';
import { Avatar, PencilThick, Picture } from '../ui-kit/icons';
import mime from 'mime';
import { useModal } from '../ui-kit/Modal';
import { UploadAvatarModal } from './UploadAvatarModal';
import { useAvatar } from './useAvatar';
import FileUploadButton from '../ui-kit/FileUploadButton';
import { Area } from 'react-easy-crop/types';
import { centralHttp } from '../http';
import API_PATHS from '../constants/apiPaths';
import { BaseResponseDto } from '../models/BaseResponse.dto';
import bytes from 'bytes';

export interface IPersonal {
  fieldNames: {
    email: string;
    phoneNumber: string;
    title: string;
    gender: string;
    firstName: string;
    lastName: string;
    dob: string;
    dobVisible: string;
    lineId: string;
    lineIdVisible: string;
  };
  userTitleOptions: {
    label: ReactNode;
    value: UserTitle;
  }[];
  genderOptions: {
    label: ReactNode;
    value: Gender;
  }[];
  hideAvatarSection?: boolean;
}

export const Personal: FC<IPersonal> = (props) => {
  const { fieldNames, userTitleOptions, genderOptions, hideAvatarSection } =
    props;
  const { t } = useTranslation();
  const [fieldInputEmail] = useField<string>(fieldNames.email);
  const [fieldInputPhoneNumber, fieldMetaPhoneNumber] = useField<string>(
    fieldNames.phoneNumber,
  );
  const [fieldInputTitle] = useField<UserTitle>(fieldNames.title);
  const [fieldInputGender] = useField<Gender>(fieldNames.gender);
  const [fieldInputFirstName, fieldInputFirstNameMeta] = useField<string>(
    fieldNames.firstName,
  );
  const [fieldInputLastName, fieldInputLastNameMeta] = useField<string>(
    fieldNames.lastName,
  );
  const [fieldInputDob, fieldInputDobMeta] = useField<Date>(fieldNames.dob);
  const [fieldInputDobVisible] = useField<boolean>(fieldNames.dobVisible);
  const [fieldInputLineId] = useField<string>(fieldNames.lineId);
  const [fieldInputLineIdVisible] = useField<boolean>(fieldNames.lineIdVisible);
  const avatarModal = useModal();
  const avatarToCrop = useAvatar();
  const avatarToDisplay = useAvatar();
  const [avatarError, setAvatarError] = useState<string>();

  function handleDobChange(value: Date) {
    fieldInputDob.onChange({ target: { name: fieldInputDob.name, value } });
  }

  function handleFileChange(evt: React.ChangeEvent<HTMLInputElement>) {
    const maxSizeMb = 3;
    const file = evt.target.files[0];
    evt.target.value = null;

    setAvatarError(null);
    if (!file) {
      return;
    }
    if (file.type !== mime.getType('jpg')) {
      setAvatarError('Please use .jpg file type');
      return;
    }
    if (file.size > bytes(`${maxSizeMb} MB`)) {
      setAvatarError('Please use image below 3 MB');
      return;
    }
    avatarToCrop.setPreview(URL.createObjectURL(file));
    avatarModal.toggle();
  }

  async function handleSaveChanges(croppedAreaPixels: Area) {
    const resizeToWidth = 170;
    const resizeToHeight = 170;
    const cropped = await avatarToCrop.crop(croppedAreaPixels);
    const resized = await avatarToCrop.resize(
      cropped,
      resizeToWidth,
      resizeToHeight,
    );
    await avatarToCrop.upload(resized);
    avatarModal.toggle();
    URL.revokeObjectURL(avatarToCrop.preview);
    await fetchAvatar();
  }

  async function fetchAvatar() {
    const res = await centralHttp.get<BaseResponseDto<User>>(API_PATHS.PROFILE);
    const key = res.data.data.profileImageKey;
    if (key) {
      avatarToDisplay.setPreview(
        `${process.env.NEXT_PUBLIC_CDN_BASE_URL}/${key}`,
      );
    }
  }

  useEffect(() => {
    fetchAvatar();
  }, [avatarToDisplay.preview]);

  return (
    <section>
      <header className="mb-6 text-subheading font-bold">
        {t('profilePage.personal')}
      </header>
      {!hideAvatarSection && (
        <>
          <div className={'flex items-center space-x-3'}>
            <label className="relative cursor-pointer">
              {avatarToDisplay.preview ? (
                <img
                  className="w-16 rounded-full"
                  src={avatarToDisplay.preview}
                />
              ) : (
                <Avatar className="text-gray-200" width={64} height={64} />
              )}
              <input
                className="hidden"
                type="file"
                accept={mime.getType('jpg')}
                onChange={handleFileChange}
              />
              <div className="absolute left-0 top-0 flex h-full w-full items-center justify-center rounded-full bg-black opacity-0 hover:opacity-50">
                <PencilThick className="text-white" width={32} height={32} />
              </div>
            </label>
            <div className="flex w-full items-center space-x-2">
              <FileUploadButton
                variant="secondary"
                btnText={t('profilePage.upload')}
                accept={mime.getType('jpg')}
                onChange={handleFileChange}
                className="max-w-min font-semibold"
              />
            </div>
            <UploadAvatarModal
              isOpen={avatarModal.isOpen}
              toggle={avatarModal.toggle}
              onOk={handleSaveChanges}
              preview={avatarToCrop.preview}
              isSaving={avatarToCrop.uploading}
            />
          </div>
          {avatarError && (
            <div className="mt-2 w-full text-caption text-red-200">
              {avatarError}
            </div>
          )}
          <div className="mt-4 text-caption">
            {t('profilePage.avatarNotice')}
          </div>
          <div className="mt-2 flex items-center space-x-2 text-footnote text-gray-500">
            <Picture />
            <div>
              {t('profilePage.recommendedFileSize', { type: 'jpg', mb: 3 })}
            </div>
          </div>
        </>
      )}
      <div className="mt-6 space-y-6 lg:space-y-8">
        <label className="block space-y-2">
          <div className="text-caption font-semibold">
            {t('profilePage.emailAddress')}
          </div>
          <InputSection {...fieldInputEmail} disabled />
        </label>
        <label className="block space-y-2">
          <div className="text-caption font-semibold">
            {t('profilePage.phoneNumber')}
          </div>
          <InputSection
            {...fieldInputPhoneNumber}
            error={fieldMetaPhoneNumber.touched && fieldMetaPhoneNumber.error}
          />
        </label>
        <div className="flex space-x-6">
          <label className="block flex-1 space-y-2">
            <div className="text-caption font-semibold">
              {t('profilePage.title')}
            </div>
            <InputSelect
              {...fieldInputTitle}
              value={find(userTitleOptions, { value: fieldInputTitle.value })}
              options={[]}
              renderOptions={userTitleOptions}
              isClearable
            />
          </label>
          <label className="block flex-1 space-y-2">
            <div className="text-caption font-semibold">
              {t('profilePage.gender')}
            </div>
            <InputSelect
              {...fieldInputGender}
              value={find(genderOptions, { value: fieldInputGender.value })}
              options={[]}
              renderOptions={genderOptions}
              isClearable
            />
          </label>
        </div>
        <div className="space-y-6 lg:flex lg:space-x-6 lg:space-y-0">
          <label className="block flex-1 space-y-2">
            <div className="text-caption font-semibold">
              {t('profilePage.firstName')}
            </div>
            <InputSection
              {...fieldInputFirstName}
              error={
                fieldInputFirstNameMeta.touched && fieldInputFirstNameMeta.error
              }
            />
          </label>
          <label className="block flex-1 space-y-2">
            <div className="text-caption font-semibold">
              {t('profilePage.lastName')}
            </div>
            <InputSection
              {...fieldInputLastName}
              error={
                fieldInputLastNameMeta.touched && fieldInputLastNameMeta.error
              }
            />
          </label>
        </div>
        <div className="space-y-6 lg:flex lg:space-x-6 lg:space-y-0">
          <label className="block flex-1 space-y-2">
            <div className="text-caption font-semibold">
              {t('profilePage.dateOfBirth')}
            </div>
            <DatePicker
              date={fieldInputDob.value}
              onChange={handleDobChange}
              className="z-10"
              clearable
              inputSectionProps={{
                error: fieldInputDobMeta.touched && fieldInputDobMeta.error,
              }}
            />
            <label className="flex items-center space-x-2">
              <CheckBox
                {...fieldInputDobVisible}
                value={undefined}
                checked={fieldInputDobVisible.value}
                type="square"
              />
              <div className="text-caption">
                {t('profilePage.dateOfBirthVisible')}
              </div>
            </label>
          </label>
          <label className="block flex-1 space-y-2">
            <div className="text-caption font-semibold">
              {t('profilePage.lineId')}
            </div>
            <InputSection {...fieldInputLineId} />
            <label className="flex items-center space-x-2">
              <CheckBox
                {...fieldInputLineIdVisible}
                value={undefined}
                checked={fieldInputLineIdVisible.value}
                type="square"
              />
              <div className="text-caption">
                {t('profilePage.lineIdVisible')}
              </div>
            </label>
          </label>
        </div>
      </div>
    </section>
  );
};
