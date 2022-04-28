import axios from 'axios';
import { format } from 'date-fns';
import * as Yup from 'yup';
import API_PATHS from '../../constants/apiPaths';
import { notificationHttp } from '../../http';
import { AwsPresignedPost } from '../../models/awsPresignedPost';
import { BaseResponseDto } from '../../models/BaseResponse.dto';
import { ISystemAnnouncement } from '../../models/systemAnnouncement';
import { s3PresignedPostPayload } from '../../utils/s3';
import { ISystemAnnouncementForm } from './SystemAnnouncementForm';

export async function uploadImage(file: File) {
  const { data } = await notificationHttp.post<
    BaseResponseDto<AwsPresignedPost>
  >(API_PATHS.SYSTEM_ANNOUNCEMENT_IMAGES, {
    mime: file.type,
  });
  const awsPresignedPost = data.data;
  const payload = s3PresignedPostPayload(file, awsPresignedPost);
  await axios.post(awsPresignedPost.url, payload);

  return awsPresignedPost;
}

export async function saveSystemAnnouncement(
  values: ISystemAnnouncementForm,
  id?: ISystemAnnouncement['id'],
) {
  const { file, startDate, endDate, title, message, ...rest } = values;

  const imageKey = file
    ? (await uploadImage(file)).fields.key
    : values.imageKey;

  const body: Record<string, any> = {
    ...rest,
    startDate: new Date(format(startDate, 'yyyy-MM-dd')).toISOString(),
    endDate: new Date(format(endDate, 'yyyy-MM-dd')).toISOString(),
    imageKey,
    titleEn: title.nameEn,
    titleTh: title.nameTh,
    messageEn: message.nameEn,
    messageTh: message.nameTh,
  };

  if (id) {
    body.id = id;
  }

  return notificationHttp.post<BaseResponseDto<ISystemAnnouncement>>(
    API_PATHS.SYSTEM_ANNOUNCEMENT,
    body,
  );
}

export const systemAnnouncementFormValidationSchema = Yup.object({
  title: Yup.object({
    nameEn: Yup.string().required('required'),
  }),
  startDate: Yup.date().required('required'),
  endDate: Yup.date().required('required'),
});
