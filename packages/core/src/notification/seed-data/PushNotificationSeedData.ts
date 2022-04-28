import { PushNotificationSubCategoryKey } from '../enum/PushNotificationSubCategory.enum';
import { INotificationVariable } from '../interface/INotificationVariable';
import { NotificationVariableDict as NV } from '../NotificationVariableDict';

type PushNotificationTemplatesType = {
  [key in PushNotificationSubCategoryKey]: {
    en: string;
    th: string;
    availableVariables: INotificationVariable[];
  };
};

export const PushNotificationSeedData: PushNotificationTemplatesType = {
  [PushNotificationSubCategoryKey.ASSIGNMENT_TO_COURSE]: {
    en: `<strong>Admin</strong> assigned you a course <strong>{{${NV.COURSE_NAME.alias}}}</strong>. Check it out in your Dashboard.`,
    th: `<strong>แอดมิน</strong> ลงเรียนคอร์ส <strong>{{${NV.COURSE_NAME.alias}}}</strong> ให้กับคุณ ไปยังหน้าแดชบอร์ดของฉันเพื่อเริ่มเรียนเลย`,
    availableVariables: [NV.COURSE_NAME],
  },
  [PushNotificationSubCategoryKey.ASSIGNMENT_TO_LEARNING_TRACK]: {
    en: `<strong>Admin</strong> assigned you a learning track <strong>{{${NV.LEARNING_TRACK_NAME.alias}}}</strong>. Check it out in your Dashboard.`,
    th: `<strong>แอดมิน</strong> ลงเรียนใน Learning Track <strong>{{${NV.LEARNING_TRACK_NAME.alias}}}</strong> ให้กับคุณ ไปยังหน้าแดชบอร์ดของฉันเพื่อเริ่มเรียนเลย`,
    availableVariables: [NV.LEARNING_TRACK_NAME],
  },
  [PushNotificationSubCategoryKey.ASSIGNMENT_TO_SESSION]: {
    en: `<strong>Admin</strong> booked you a session for <strong>{{${NV.SESSION_NAME.alias}}}: {{${NV.SESSION_START_DATETIME.alias}}}/{{${NV.SESSION_END_DATETIME.alias}}}</strong>. Go to Dashboard to see all your bookings.`,
    th: `<strong>แอดมิน</strong> จองที่นั่งสำหรับหลักสูตร <strong>{{${NV.SESSION_NAME.alias}}}: {{${NV.SESSION_START_DATETIME.alias}}}/{{${NV.SESSION_END_DATETIME.alias}}}</strong> ให้กับคุณ ไปยังหน้าแดชบอร์ดของฉันเพื่อดูการจองทั้งหมด`,
    availableVariables: [
      NV.SESSION_NAME,
      NV.SESSION_START_DATETIME,
      NV.SESSION_END_DATETIME,
    ],
  },
  [PushNotificationSubCategoryKey.CERTIFICATE_UNLOCKED]: {
    en: `Congratulations! You have unlocked certificate <strong>{{${NV.CERTIFICATE_NAME.alias}}}</strong>. Check it out now!`,
    th: `ยินดีด้วย! คุณได้ปลดล็อกใบประกาศนียบัตร <strong>{{${NV.CERTIFICATE_NAME.alias}}}</strong> แล้ว ไปดูตอนนี้เลย!`,
    availableVariables: [NV.CERTIFICATE_NAME],
  },
  [PushNotificationSubCategoryKey.LEARNING_ACTIVITY_BOOKING_CANCELLED_BY_ADMIN]:
    {
      en: `<strong>Admin</strong> cancelled a booking for <strong>{{${NV.SESSION_NAME.alias}}}: {{${NV.SESSION_START_DATETIME.alias}}}/{{${NV.SESSION_END_DATETIME.alias}}}</strong>.`,
      th: `<strong>แอดมิน</strong> ยกเลิกการจองสำหรับหลักสูตร <strong>{{${NV.SESSION_NAME.alias}}}: {{${NV.SESSION_START_DATETIME.alias}}}/{{${NV.SESSION_END_DATETIME.alias}}}</strong> ให้กับคุณ`,
      availableVariables: [
        NV.SESSION_NAME,
        NV.SESSION_START_DATETIME,
        NV.SESSION_END_DATETIME,
      ],
    },
  [PushNotificationSubCategoryKey.LEARNING_ACTIVITY_BOOKING_CANCELLED_BY_USER]:
    {
      en: `You have successfully cancelled a booking for <strong>{{${NV.SESSION_NAME.alias}}}: {{${NV.SESSION_START_DATETIME.alias}}}/{{${NV.SESSION_END_DATETIME.alias}}}</strong>.`,
      th: `คุณได้ยกเลิกการจองสำหรับหลักสูตร <strong>{{${NV.SESSION_NAME.alias}}}: {{${NV.SESSION_START_DATETIME.alias}}}/{{${NV.SESSION_END_DATETIME.alias}}}</strong> แล้ว`,
      availableVariables: [
        NV.SESSION_NAME,
        NV.SESSION_START_DATETIME,
        NV.SESSION_END_DATETIME,
      ],
    },
  [PushNotificationSubCategoryKey.LEARNING_ACTIVITY_SESSION_CANCELLED_BY_ADMIN]:
    {
      en: `<strong>Admin</strong> cancelled a session for <strong>{{${NV.SESSION_NAME.alias}}}: {{${NV.SESSION_START_DATETIME.alias}}}/{{${NV.SESSION_END_DATETIME.alias}}}</strong>.`,
      th: `<strong>แอดมิน</strong> ยกเลิกการสอนหลักสูตร <strong>{{${NV.SESSION_NAME.alias}}}: {{${NV.SESSION_START_DATETIME.alias}}}/{{${NV.SESSION_END_DATETIME.alias}}}</strong>`,
      availableVariables: [
        NV.SESSION_NAME,
        NV.SESSION_START_DATETIME,
        NV.SESSION_END_DATETIME,
      ],
    },
  [PushNotificationSubCategoryKey.LEARNING_ACTIVITY_COURSE_COMPLETION]: {
    en: `Yay! You have completed the course <strong>{{${NV.COURSE_NAME.alias}}}</strong>. Check it out in your Dashboard.`,
    th: `เย้! คุณเรียนหลักสูตร <strong>{{${NV.COURSE_NAME.alias}}}</strong> จบแล้ว ไปยังหน้าแดชบอร์ดของฉันเพื่อตรวจสอบเลย`,
    availableVariables: [NV.COURSE_NAME],
  },
  [PushNotificationSubCategoryKey.LEARNING_ACTIVITY_COURSE_ENROLLMENT]: {
    en: `You enrolled in a course <strong>{{${NV.COURSE_NAME.alias}}}</strong>. Check it out in your Dashboard.`,
    th: `คุณได้ลงทะเบียนเรียนหลักสูตร <strong>{{${NV.COURSE_NAME.alias}}}</strong> ไปยังหน้าแดชบอร์ดของฉันเพื่อเริ่มเรียนเลย`,
    availableVariables: [NV.COURSE_NAME],
  },
  [PushNotificationSubCategoryKey.LEARNING_ACTIVITY_LEARNING_TRACK_COMPLETION]:
    {
      en: `Yay! You have completed the learning track <strong>{{${NV.LEARNING_TRACK_NAME.alias}}}</strong>. Check it out in your Dashboard.`,
      th: `เย้! คุณเรียน Learning Track <strong>{{${NV.LEARNING_TRACK_NAME.alias}}}</strong> จบแล้ว ไปยังหน้าแดชบอร์ดของฉันเพื่อตรวจสอบเลย`,
      availableVariables: [NV.LEARNING_TRACK_NAME],
    },
  [PushNotificationSubCategoryKey.LEARNING_ACTIVITY_LEARNING_TRACK_ENROLLMENT]:
    {
      en: `You have enrolled in a learning track <strong>{{${NV.LEARNING_TRACK_NAME.alias}}}</strong>. Check it out in your Dashboard.`,
      th: `คุณได้ลงทะเบียนเรียนใน Learning Track <strong>{{${NV.LEARNING_TRACK_NAME.alias}}}</strong> ไปยังหน้าแดชบอร์ดของฉันเพื่อเริ่มเรียนเลย`,
      availableVariables: [NV.LEARNING_TRACK_NAME],
    },
  [PushNotificationSubCategoryKey.LEARNING_ACTIVITY_SESSION_BOOKED]: {
    en: `You booked a session for <strong>{{${NV.SESSION_NAME.alias}}}: {{${NV.SESSION_START_DATETIME.alias}}}/{{${NV.SESSION_END_DATETIME.alias}}}</strong>. Go to Dashboard to see all your bookings.`,
    th: `คุณได้จองที่นั่งสำหรับหลักสูตร <strong>{{${NV.SESSION_NAME.alias}}}: {{${NV.SESSION_START_DATETIME.alias}}}/{{${NV.SESSION_END_DATETIME.alias}}}</strong> เรียบร้อยแล้ว ไปยังหน้าแดชบอร์ดของฉันเพื่อดูการจองทั้งหมด`,
    availableVariables: [
      NV.SESSION_NAME,
      NV.SESSION_START_DATETIME,
      NV.SESSION_END_DATETIME,
    ],
  },
  [PushNotificationSubCategoryKey.MEMBERSHIP_ACTIVATED]: {
    en: `Your new membership for <strong>{{${NV.PACKAGE_NAME.alias}}}</strong> is starting now! Check it out in your My Package page.`,
    th: `สมาชิกแพ็คเกจ <strong>{{${NV.PACKAGE_NAME.alias}}}</strong> สามารถเริ่มต้นใช้งานได้แล้ว! ไปยังหน้าแพ็คเกจของฉันเพื่อดูรายละเอียดแพ็คเกจ`,
    availableVariables: [NV.PACKAGE_NAME],
  },
  [PushNotificationSubCategoryKey.MEMBERSHIP_EXPIRING_REMINDER]: {
    en: `<strong>Reminder</strong> Your membership for <strong>{{${NV.PACKAGE_NAME.alias}}}</strong> will be expired in <strong>7 days</strong>. You won't be able to do some activities once it expires. Review it now in your My Package page.`,
    th: `<strong>แจ้งเตือน</strong> อายุสมาชิกของแพ็คเกจ <strong>{{${NV.PACKAGE_NAME.alias}}}</strong> กำลังจะสิ้นสุดใน <strong>7 วัน</strong> หลังจากนั้นคุณจะไม่สามารถใช้งานในบางส่วนได้ ไปยังหน้าแพ็คเกจของฉันเพื่อต่ออายุเลย`,
    availableVariables: [NV.PACKAGE_NAME],
  },
  [PushNotificationSubCategoryKey.MEMBERSHIP_RENEWAL]: {
    en: `You have renewed a membership for <strong>{{${NV.PACKAGE_NAME.alias}}}</strong> and it will be available until <strong>{{${NV.MEMBERSHIP_EXPIRY_DATE.alias}}}</strong>.`,
    th: `คุณได้ต่ออายุสมาชิกสำหรับแพ็คเกจ <strong>{{${NV.PACKAGE_NAME.alias}}}</strong> แล้ว โดยจะสามารถ ใช้งานได้ถึงวันที่ <strong>{{${NV.MEMBERSHIP_EXPIRY_DATE.alias}}}</strong>`,
    availableVariables: [NV.PACKAGE_NAME, NV.MEMBERSHIP_EXPIRY_DATE],
  },
  [PushNotificationSubCategoryKey.REMINDER_ASSESSMENT_RESULT_REQUIRED]: {
    en: `<strong>Reminder</strong> You will need an assessment result for <strong>{{${NV.ASSESSMENT_NAME.alias}}}</strong> before joining the session for <strong>{{${NV.SESSION_NAME.alias}}}</strong>. See it now.`,
    th: `<strong>แจ้งเตือน</strong> อย่าลืมทำแบบประเมินของ <strong>{{${NV.ASSESSMENT_NAME.alias}}}</strong> ก่อนเข้าห้องเรียนของหลักสูตร <strong>{{${NV.SESSION_NAME.alias}}}</strong> ด้วยนะ ไปยังหน้าแบบประเมินเลย`,
    availableVariables: [NV.ASSESSMENT_NAME, NV.SESSION_NAME],
  },
  [PushNotificationSubCategoryKey.REMINDER_ASSESSMENT_UNLOCKED]: {
    en: `You have unlocked a new assessment <strong>{{${NV.ASSESSMENT_NAME.alias}}}</strong>. Check it out now!`,
    th: `คุณได้ปลดล็อกแบบประเมิน <strong>{{${NV.ASSESSMENT_NAME.alias}}}</strong> แล้ว ไปยังหน้าแบบประเมินเลย`,
    availableVariables: [NV.ASSESSMENT_NAME],
  },
  [PushNotificationSubCategoryKey.REMINDER_COMPLETE_REQUIRED_COURSE]: {
    en: `<strong>Reminder</strong> Please make sure to complete your course <strong>{{${NV.COURSE_NAME.alias}}}</strong> before it expires in <strong>{{${NV.MEMBERSHIP_REMAINING_DAYS.alias}}} days</strong>! Check it out now!`,
    th: `<strong>แจ้งเตือน</strong> อย่าลืมเรียนหลักสูตร <strong>{{${NV.COURSE_NAME.alias}}}</strong> ให้จบ ก่อนที่จะหมดอายุในอีก <strong>{{${NV.MEMBERSHIP_REMAINING_DAYS.alias}}}</strong> วันนะ! ไปเรียนตอนนี้เลย!`,
    availableVariables: [NV.COURSE_NAME, NV.MEMBERSHIP_REMAINING_DAYS],
  },
  [PushNotificationSubCategoryKey.REMINDER_COMPLETE_REQUIRED_LEARNING_TRACK]: {
    en: `<strong>Reminder</strong> Please make sure to complete your learning track <strong>{{${NV.LEARNING_TRACK_NAME.alias}}}</strong> before it expires in <strong>{{${NV.MEMBERSHIP_REMAINING_DAYS.alias}}} days</strong>! Check it out now!`,
    th: `<strong>แจ้งเตือน</strong> อย่าลืมเรียน Learning Track <strong>{{${NV.LEARNING_TRACK_NAME.alias}}}</strong> ให้จบ ก่อนที่จะหมดอายุในอีก <strong>{{${NV.MEMBERSHIP_REMAINING_DAYS.alias}}}</strong> วันนะ! ไปเรียนตอนนี้เลย!`,
    availableVariables: [NV.LEARNING_TRACK_NAME, NV.MEMBERSHIP_REMAINING_DAYS],
  },
  [PushNotificationSubCategoryKey.REMINDER_UPCOMING_BOOKED_EVENTS]: {
    en: `Your session for <strong>{{${NV.SESSION_NAME.alias}}}: {{${NV.SESSION_START_DATETIME.alias}}}/{{${NV.SESSION_END_DATETIME.alias}}}</strong> will start in 2 days. Go to Dashboard to see all your bookings. See your there!`,
    th: `หลักสูตร <strong>{{${NV.SESSION_NAME.alias}}}: {{${NV.SESSION_START_DATETIME.alias}}}/{{${NV.SESSION_END_DATETIME.alias}}}</strong> ที่คุณได้จองไว้จะเริ่ม ในอีก 2 วันแล้วนะ ไปยังหน้าแดชบอร์ดของฉันเพื่อดูการจองทั้งหมด แล้วเจอกันนะ!`,
    availableVariables: [
      NV.SESSION_NAME,
      NV.SESSION_START_DATETIME,
      NV.SESSION_END_DATETIME,
    ],
  },
  [PushNotificationSubCategoryKey.SYSTEM_ANNOUNCEMENT]: {
    en: `<strong>{{${NV.SYSTEM_ANNOUNCEMENT_TITLE.alias}}} on {{${NV.SYSTEM_ANNOUNCEMENT_MESSAGE_START_DATETIME.alias}}} - {{${NV.SYSTEM_ANNOUNCEMENT_MESSAGE_END_DATETIME.alias}}}.</strong> {{${NV.SYSTEM_ANNOUNCEMENT_MESSAGE.alias}}}`,
    th: `<strong>{{${NV.SYSTEM_ANNOUNCEMENT_TITLE.alias}}} วันที่ {{${NV.SYSTEM_ANNOUNCEMENT_MESSAGE_START_DATETIME.alias}}} - {{${NV.SYSTEM_ANNOUNCEMENT_MESSAGE_END_DATETIME.alias}}}.</strong> {{${NV.SYSTEM_ANNOUNCEMENT_MESSAGE.alias}}}`,
    availableVariables: [
      NV.SYSTEM_ANNOUNCEMENT_TITLE,
      NV.SYSTEM_ANNOUNCEMENT_MESSAGE_START_DATETIME,
      NV.SYSTEM_ANNOUNCEMENT_MESSAGE_END_DATETIME,
      NV.SYSTEM_ANNOUNCEMENT_MESSAGE,
    ],
  },
};
