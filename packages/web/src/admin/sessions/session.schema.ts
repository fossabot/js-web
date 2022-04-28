import * as Yup from 'yup';

export const sessionSchema = Yup.object().shape({
  courseOutlineId: Yup.string().trim().required('required'),
  seats: Yup.number().min(1, 'sessionForm.seat').required('required'),
  webinarTool: Yup.string().trim().optional().nullable(),
  location: Yup.string().trim().optional().nullable(),
  participantUrl: Yup.string()
    .url('sessionForm.url')
    .trim()
    .optional()
    .nullable(),
  language: Yup.string().trim().required('required'),
  startDateTime: Yup.date().required('required'),
  endDateTime: Yup.date()
    .required('required')
    .min(Yup.ref('startDateTime'), 'sessionForm.endDateTime'),
  instructorId: Yup.string().trim().required('required'),
  isPrivate: Yup.boolean().required('required'),
});
