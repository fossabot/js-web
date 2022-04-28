import * as Yup from 'yup';

export const menuSchema = Yup.object({
  topicHeadlineEn: Yup.string(),
  topicHeadlineTh: Yup.string(),
  learningWayHeadlineEn: Yup.string(),
  learningWayHeadlineTh: Yup.string(),
});

export const topicSchema = Yup.object({
  topicIds: Yup.array().of(Yup.string()),
});

export const learningWaySchema = Yup.object({
  learningWayIds: Yup.array().of(Yup.string()),
});
