import { EmailNotificationSubCategoryKey } from '../enum/EmailNotificationSubCategory.enum';
import { INotificationVariable } from '../interface/INotificationVariable';
import { NotificationVariableDict as NV } from '../NotificationVariableDict';

export type EmailNotificationTemplateType = {
  [key: string]: {
    title: string;
    en: {
      subject: string;
      bodyHTML: string;
      bodyText: string;
    };
    th: {
      subject: string;
      bodyHTML: string;
      bodyText: string;
    };
    availableVariables: INotificationVariable[];
  };
};

/**
 * These email templates will be used for generate the seed data.
 * Don't use it directly.
 */
export const EmailNotificationSeedData: EmailNotificationTemplateType = {
  [EmailNotificationSubCategoryKey.MEMBERSHIP_WELCOME]: {
    title: 'Welcome email',

    availableVariables: [
      NV.PACKAGE_NAME,
      NV.FULL_NAME,
      NV.EMAIL,
      NV.ACCOUNT_ACTIVATION_LINK,
    ],

    en: {
      subject: `Welcome to YourNextU: {{${NV.PACKAGE_NAME.alias}}}`,

      bodyHTML: `<p><strong>Dear {{${NV.FULL_NAME.alias}}}}</strong>,</p>,
      <p>Welcome to YourNextU. We are pleased that you decided to become part of our family!</p>
      <p><strong>Username: {{${NV.EMAIL.alias}}}</strong></p>
      <p>Login to start your journey with 1 easy step</p>
      <p>Click on the link below to activate your account and set your password (This link is one-time use and you can see the password creation instructions from the login page.)<br />
      <strong>{{${NV.ACCOUNT_ACTIVATION_LINK.alias}}}</strong></p>`,

      bodyText: `Dear {{${NV.FULL_NAME.alias}}},
  
      Welcome to YourNextU. We are pleased that you decided to become part of our family!
      
      Username: {{${NV.EMAIL.alias}}}
      
      Login to start your journey with 1 easy step
      
      Click on the link below to activate your account and set your password (This link is one-time use and you can see the password creation instructions from the login page.)
      {{${NV.ACCOUNT_ACTIVATION_LINK.alias}}}`,
    },

    th: {
      subject: `ยินดีต้อนรับเข้าสู่ YourNextU: {{${NV.PACKAGE_NAME.alias}}}`,

      bodyHTML: `<p><strong>สวัสดีคุณ {{${NV.FULL_NAME.alias}}}</strong></p>
      <p>ยินดีต้อนรับสู่ YourNextU เรายินดีอย่างยิ่งที่คุณตัดสินใจเป็นสมาชิกกับเรา!</p>
      <p><strong>Username: {{${NV.EMAIL.alias}}}</strong></p>
      <p>เข้าสู่ระบบเพื่อเริ่มต้นเรียน ด้วย 1 ขั้นตอนง่ายๆ</p>
      <p>คลิกที่ลิงก์เพื่อเปิดใช้งานบัญชี และตั้งรหัสผ่าน (ลิงก์สามารถกดได้ครั้งเดียว โดยสามารถดูคำแนะนำการตั้งรหัสผ่านใหม่ได้จากหน้าการเข้าสู่ระบบ)<br />
      <strong>{{${NV.ACCOUNT_ACTIVATION_LINK.alias}}}</strong></p>
      <p>หากคุณมีข้อสงสัยหรือต้องการความช่วยเหลือ Member Services ของเราพร้อมให้บริการเสมอ<br />
      ขอให้คุณสนุกกับการเรียนรู้ที่ YourNextU</p>`,

      bodyText: `สวัสดีคุณ {{${NV.FULL_NAME.alias}}}
      
      ยินดีต้อนรับสู่ YourNextU เรายินดีอย่างยิ่งที่คุณตัดสินใจเป็นสมาชิกกับเรา! 
      
      Username: {{${NV.EMAIL.alias}}}
      
      เข้าสู่ระบบเพื่อเริ่มต้นเรียน ด้วย 1 ขั้นตอนง่ายๆ
      
      คลิกที่ลิงก์เพื่อเปิดใช้งานบัญชี และตั้งรหัสผ่าน (ลิงก์สามารถกดได้ครั้งเดียว โดยสามารถดูคำแนะนำการตั้งรหัสผ่านใหม่ได้จากหน้าการเข้าสู่ระบบ)
      {{${NV.ACCOUNT_ACTIVATION_LINK.alias}}}
      
      หากคุณมีข้อสงสัยหรือต้องการความช่วยเหลือ Member Services ของเราพร้อมให้บริการเสมอ
      ขอให้คุณสนุกกับการเรียนรู้ที่ YourNextU`,
    },
  },

  [EmailNotificationSubCategoryKey.MEMBERSHIP_VERIFY_EMAIL]: {
    title: 'Verify your email',

    availableVariables: [NV.FULL_NAME, NV.ACCOUNT_ACTIVATION_LINK],

    en: {
      subject: 'Welcome to YourNextU. Please verify your email',

      bodyHTML: `<p><strong>Dear {{${NV.FULL_NAME.alias}}}</strong>,</p>

      <p>Welcome to YourNextU. We are pleased that you decided to become part of our family!</p>
      
      <p>To finish the process, just follow the verification link  <strong>{{${NV.ACCOUNT_ACTIVATION_LINK.alias}}}</strong>  in the email.</p>`,

      bodyText: `Dear {{${NV.FULL_NAME.alias}}},

      Welcome to YourNextU. We are pleased that you decided to become part of our family!
      
      To finish the process, just follow the verification link  {{${NV.ACCOUNT_ACTIVATION_LINK.alias}}}  in the email.`,
    },

    th: {
      subject: 'ยินดีต้อนรับเข้าสู่ YourNextU กรุณายืนยันอีเมลของคุณ',

      bodyHTML: `<p><strong>สวัสดีคุณ {{${NV.FULL_NAME.alias}}}</strong></p>

      <p>ยินดีต้อนรับสู่ YourNextU เรายินดีอย่างยิ่งที่คุณตัดสินใจเป็นสมาชิกกับเรา!</p>
      
      <p>กรุณายืนยันอีเมลของคุณ โดยกด <strong>{{${NV.ACCOUNT_ACTIVATION_LINK.alias}}}</strong> เพื่อการใช้งานอย่างเต็มรูปแบบ</p>
      
      <p>หากคุณมีข้อสงสัยหรือต้องการความช่วยเหลือ Member Services ของเราพร้อมให้บริการเสมอ
      ขอให้คุณสนุกกับการเรียนรู้ที่ YourNextU</p>`,

      bodyText: `สวัสดีคุณ {{${NV.FULL_NAME.alias}}}

      ยินดีต้อนรับสู่ YourNextU เรายินดีอย่างยิ่งที่คุณตัดสินใจเป็นสมาชิกกับเรา! 
      
      กรุณายืนยันอีเมลของคุณ โดยกด {{${NV.ACCOUNT_ACTIVATION_LINK.alias}}} เพื่อการใช้งานอย่างเต็มรูปแบบ
      
      หากคุณมีข้อสงสัยหรือต้องการความช่วยเหลือ Member Services ของเราพร้อมให้บริการเสมอ
      ขอให้คุณสนุกกับการเรียนรู้ที่ YourNextU`,
    },
  },

  [EmailNotificationSubCategoryKey.MEMBERSHIP_RESET_PASSWORD]: {
    title: 'Reset password',

    availableVariables: [NV.FULL_NAME, NV.EMAIL, NV.RESET_PASSWORD_LINK],

    en: {
      subject: 'Set your new YourNextU account password',

      bodyHTML: `<p><strong>Dear {{${NV.FULL_NAME.alias}}}</strong>,</p>

      <p>You are receiving this email because we received a password reset request for your account.<br />
      To change or set password for {{${NV.EMAIL.alias}}} account, click the link below:</p>
      
      <p><strong>{{${NV.RESET_PASSWORD_LINK.alias}}}</strong></p>
      
      <p>(This link is one-time use and you can see the password creation instructions from the login page.)</p>`,

      bodyText: `Dear {{${NV.FULL_NAME.alias}}},

      You are receiving this email because we received a password reset request for your account.
      To change or set password for {{${NV.EMAIL.alias}}} account, click the link below:
      
      {{${NV.RESET_PASSWORD_LINK.alias}}}
      
      (This link is one-time use and you can see the password creation instructions from the login page.)`,
    },

    th: {
      subject: 'ตั้งค่ารหัสผ่านใหม่สำหรับ YourNextU',

      bodyHTML: `<p><strong>สวัสดีคุณ {{${NV.FULL_NAME.alias}}}</strong></p>

      <p>ทางเราได้รับคำขอตั้งรหัสผ่านใหม่จากบัญชีของคุณ<br />
      กรุณากดที่ลิงก์ด้านล่างเพื่อตั้งรหัสผ่านของบัญชี {{${NV.EMAIL.alias}}} ของคุณในYourNextU ใหม่</p>
      
      <p><strong>{{${NV.RESET_PASSWORD_LINK.alias}}}</strong></p>
      
      <p>(ลิงก์สามารถกดได้ครั้งเดียว โดยสามารถดูคำแนะนำการตั้งรหัสผ่านใหม่ได้จากหน้ารีเซ็ตรหัสผ่าน)</p>`,

      bodyText: `สวัสดีคุณ {{${NV.FULL_NAME.alias}}}

      ทางเราได้รับคำขอตั้งรหัสผ่านใหม่จากบัญชีของคุณ
      กรุณากดที่ลิงก์ด้านล่างเพื่อตั้งรหัสผ่านของบัญชี {{${NV.EMAIL.alias}}} ของคุณในYourNextU ใหม่
      
      {{${NV.RESET_PASSWORD_LINK.alias}}}
      
      (ลิงก์สามารถกดได้ครั้งเดียว โดยสามารถดูคำแนะนำการตั้งรหัสผ่านใหม่ได้จากหน้ารีเซ็ตรหัสผ่าน)`,
    },
  },

  [EmailNotificationSubCategoryKey.MEMBERSHIP_EXPIRY_REMINDER]: {
    title: 'Membership expire remider',

    availableVariables: [
      NV.FULL_NAME,
      NV.MEMBERSHIP_EXPIRY_DATE,
      NV.PACKAGE_PAGE_LINK,
    ],

    en: {
      subject: 'YourNextU account almost expired, Renew to keep learning',

      bodyHTML: `<p><strong>Dear {{${NV.FULL_NAME.alias}}}</strong>,</p>
      <p>We truly appreciate the trust you have placed with us. Unfortunately, your account will be expired on <strong>{{${NV.MEMBERSHIP_EXPIRY_DATE.alias}}}</strong>.<br />
      You can renew your membership by clicking <strong>{{${NV.PACKAGE_PAGE_LINK.alias}}}</strong>.</p>
      <p>We look forward to continuing to serve you in the future and thank you for choosing YourNextU as your learning companion</p>`,

      bodyText: `Dear {{${NV.FULL_NAME.alias}}},

      We truly appreciate the trust you have placed with us. Unfortunately, your account will be expired on {{${NV.MEMBERSHIP_EXPIRY_DATE.alias}}}. 
      You can renew your membership by clicking {{${NV.PACKAGE_PAGE_LINK.alias}}}.
      
      We look forward to continuing to serve you in the future and thank you for choosing YourNextU as your learning companion`,
    },

    th: {
      subject: 'บัญชี YourNextU ของคุณใกล้หมดอายุแล้ว',

      bodyHTML: `<p><strong>สวัสดีคุณ {{${NV.FULL_NAME.alias}}}</strong></p>

      <p>ขอบคุณที่ร่วมเดินบนเส้นทางแห่งการเรียนรู้กับ YourNextU !</p>
      
      <p>บัญชีของคุณจะหมดอายุในวันที่ <strong>{{${NV.MEMBERSHIP_EXPIRY_DATE.alias}}}</strong></p>
      
      <p>คลิกที่นี่ <strong>{{${NV.PACKAGE_PAGE_LINK.alias}}}</strong> เพื่อต่ออายุสมาชิกเเละออกเดินทางต่อไปด้วยกัน</p>`,

      bodyText: `สวัสดีคุณ {{${NV.FULL_NAME.alias}}}

      ขอบคุณที่ร่วมเดินบนเส้นทางแห่งการเรียนรู้กับ YourNextU !
      
      บัญชีของคุณจะหมดอายุในวันที่ {{${NV.MEMBERSHIP_EXPIRY_DATE.alias}}}
      
      คลิกที่นี่ {{${NV.PACKAGE_PAGE_LINK.alias}}} เพื่อต่ออายุสมาชิกเเละออกเดินทางต่อไปด้วยกัน`,
    },
  },

  [EmailNotificationSubCategoryKey.MEMBERSHIP_BUY_NEW_PACKAGE]: {
    title: 'Buy new packages',

    availableVariables: [NV.FULL_NAME, NV.PACKAGE_PAGE_LINK],

    en: {
      subject: 'Completed all courses? Keep Learning with YourNextU',

      bodyHTML: `<p><strong>Dear {{${NV.FULL_NAME.alias}}}</strong>,</p>

      <p><strong>Congratuations. You have completed all courses in your current package.</strong></p>
      
      <p><strong>To keep your learning momentum, you can click here {{${NV.PACKAGE_PAGE_LINK.alias}}} to choose more courses and continue learning.</strong></p>

      <p>We look forward to serve you in the future and thank you for choosing YourNextU as your learning companion.</p>`,

      bodyText: `Dear {{${NV.FULL_NAME.alias}}},

      Congratuations. You have completed all courses in your current package.</strong>

      To keep your learning momentum, you can click here {{${NV.PACKAGE_PAGE_LINK.alias}}} to choose more courses and continue learning.
      
      We look forward to serve you in the future and thank you for choosing YourNextU as your learning companion.`,
    },

    th: {
      subject: 'Completed all courses? Keep Learning with YourNextU',

      bodyHTML: `<p><strong>สวัสดีคุณ {{${NV.FULL_NAME.alias}}}</strong></p>

      <p>ยินดีด้วยคุณเรียนครบทุกหลักสูตรในแพ็คเกจแล้ว</p>

      <p>เพื่อการเรียนรู้อย่างต่อเนื่อง คุณสามารถคลิกที่นี่ <strong>{{${NV.PACKAGE_PAGE_LINK.alias}}}</strong> เพื่อเลือกซื้อแพ็คเกจอื่นๆ เเละออกเดินทางต่อไปด้วยกัน</p>`,

      bodyText: `สวัสดีคุณ {{${NV.FULL_NAME.alias}}}

      ยินดีด้วยคุณเรียนครบทุกหลักสูตรในแพ็คเกจแล้ว
      
      เพื่อการเรียนรู้อย่างต่อเนื่อง คุณสามารถคลิกที่นี่ {{${NV.PACKAGE_PAGE_LINK.alias}}} เพื่อเลือกซื้อแพ็คเกจอื่นๆ เเละออกเดินทางต่อไปด้วยกัน`,
    },
  },

  [EmailNotificationSubCategoryKey.BOOKING_CONFIRMATION_VIRTUAL]: {
    title: 'Virtual - Booking Confirmation',

    availableVariables: [
      NV.SESSION_NAME,
      NV.FULL_NAME,
      NV.SESSION_START_DATETIME,
      NV.SESSION_END_DATETIME,
      NV.INSTRUCTOR_NAME,
      NV.SESSION_WAITING_ROOM_LINK,
      NV.COURSE_DETAIL_LINK,
    ],

    en: {
      subject: `YourNextU: We've saved you a seat at {{${NV.SESSION_NAME.alias}}}`,

      bodyHTML: `<p><strong>Hello! {{${NV.FULL_NAME.alias}}}</strong></p>

      <p>Thanks for your booking. Your seat is saved, and we look forward to seeing you there.</p>
      
      <p>Session: {{${NV.SESSION_NAME.alias}}}<br />
      Start Date/Time: {{${NV.SESSION_START_DATETIME.alias}}}<br />
      End Date/Time: {{${NV.SESSION_END_DATETIME.alias}}}<br />
      Instructor: {{${NV.INSTRUCTOR_NAME.alias}}}<br />
      Link: {{${NV.SESSION_WAITING_ROOM_LINK.alias}}}</p>
      
      <p><strong>Important note</strong><br />
      Please join the class 20 minutes before the session starts, and log-in before joining the session. Participants that enter late will not be allowed to join the session.</p>
      
      <p>Click on the link below to go to the course page. Don't forget to download the course materials for the session.<br />
      <strong>{{${NV.COURSE_DETAIL_LINK.alias}}}</strong></p>`,

      bodyText: `Hello! {{${NV.FULL_NAME.alias}}}

      Thanks for your booking. Your seat is saved, and we look forward to seeing you there.
      
      Session: {{${NV.SESSION_NAME.alias}}}
      Start Date/Time: {{${NV.SESSION_START_DATETIME.alias}}}
      End Date/Time: {{${NV.SESSION_END_DATETIME.alias}}}
      Instructor: {{${NV.INSTRUCTOR_NAME.alias}}}
      Link: {{${NV.SESSION_WAITING_ROOM_LINK.alias}}}
      
      Important note
      Please join the class 20 minutes before the session starts, and log-in before joining the session. Participants that enter late will not be allowed to join the session.
      
      Click on the link below to go to the course page. Don't forget to download the course materials for the session.
      {{${NV.COURSE_DETAIL_LINK.alias}}}`,
    },

    th: {
      subject: `YourNextU: ยืนยันการลงทะเบียนคลาสเรียน {{${NV.SESSION_NAME.alias}}}`,

      bodyHTML: `<p><strong>สวัสดีค่ะ คุณ {{${NV.FULL_NAME.alias}}}</strong></p>

      <p>ขอบคุณสำหรับการสำรองที่นั่ง คุณสามารถดูรายละเอียดได้ตามนี้:</p>
      
      <p>ชื่อคลาสเรียน: {{${NV.SESSION_NAME.alias}}}<br />
      วันและเวลาเริ่ม: {{${NV.SESSION_START_DATETIME.alias}}}<br />
      วันและเวลาจบ: {{${NV.SESSION_END_DATETIME.alias}}}<br />
      วิทยากร: {{${NV.INSTRUCTOR_NAME.alias}}}<br />
      ลิงก์เข้าเรียน: {{${NV.SESSION_WAITING_ROOM_LINK.alias}}}</p>
      
      <p><strong>หมายเหตุ</strong>: กรุณาเข้าร่วมคลาส 20 นาทีก่อนเวลาเริ่มเรียน หากขอเข้าห้องเรียนสายเกินกว่าเวลาที่กำหนด เจ้าหน้าขอสงวนสิทธิ์ในการเข้าเรียน</p>
      
      <p>กดที่ลิงก์ด้านล่างเพื่อไปที่หลักสูตร และอย่าลืมเข้าไปดาวน์โหลดเอกสารการประกอบการเรียนที่หัวข้อ Material<br />
      <strong>{{${NV.COURSE_DETAIL_LINK.alias}}}</strong></p>`,

      bodyText: `สวัสดีค่ะ คุณ {{${NV.FULL_NAME.alias}}}

      ขอบคุณสำหรับการสำรองที่นั่ง คุณสามารถดูรายละเอียดได้ตามนี้:
      
      ชื่อคลาสเรียน: {{${NV.SESSION_NAME.alias}}}
      วันและเวลาเริ่ม: {{${NV.SESSION_START_DATETIME.alias}}}
      วันและเวลาจบ: {{${NV.SESSION_END_DATETIME.alias}}}
      วิทยากร: {{${NV.INSTRUCTOR_NAME.alias}}}
      ลิงก์เข้าเรียน: {{${NV.SESSION_WAITING_ROOM_LINK.alias}}}
      
      หมายเหตุ: กรุณาเข้าร่วมคลาส 20 นาทีก่อนเวลาเริ่มเรียน หากขอเข้าห้องเรียนสายเกินกว่าเวลาที่กำหนด เจ้าหน้าขอสงวนสิทธิ์ในการเข้าเรียน
      
      กดที่ลิงก์ด้านล่างเพื่อไปที่หลักสูตร และอย่าลืมเข้าไปดาวน์โหลดเอกสารการประกอบการเรียนที่หัวข้อ Material 
      {{${NV.COURSE_DETAIL_LINK.alias}}}`,
    },
  },

  [EmailNotificationSubCategoryKey.BOOKING_CONFIRMATION_F2F]: {
    title: 'F2F - Booking confirmation',

    availableVariables: [
      NV.SESSION_NAME,
      NV.FULL_NAME,
      NV.SESSION_START_DATETIME,
      NV.SESSION_END_DATETIME,
      NV.INSTRUCTOR_NAME,
      NV.LOCATION_NAME,
    ],

    en: {
      subject: `YourNextU: We've saved you a seat at {{${NV.SESSION_NAME.alias}}}`,

      bodyHTML: `<p><strong>Hello! {{${NV.FULL_NAME.alias}}}</strong></p>

      <p>Thank you for confirming your attendance. Your seat is reserved, and we're very much looking forward to seeing you there.</p>
      
      <p>Session: {{${NV.SESSION_NAME.alias}}}<br />
      Start Date/Time: {{${NV.SESSION_START_DATETIME.alias}}}<br />
      End Date/Time: {{${NV.SESSION_END_DATETIME.alias}}}<br />
      Instructor: {{${NV.INSTRUCTOR_NAME.alias}}}<br />
      Venue: {{${NV.LOCATION_NAME.alias}}}</p>
      
      <p>Please be informed that pre-requisite coursework is required in some courses. In the event that we detect that you have not passed the previous course, we apologize to cancel your registration for this course and recommend you choose a new schedule at "My Dashboard" in YourNextU platform.</p>
      
      <p><strong>Important Information</strong><br />
      1. Identification card, government official card, employee card (with photo and full name) or government-issued card is required to verify identity at the registration point.<br />
      2. Vaccination Certificate or Card is required.<br />
      3. For those who have not yet received a full vaccination, you must provide your COVID-19 test result (RT-PCR or Antigen Test Kit) issued within 7 days.<br />
      4. Please be on time. Participants that enter late will not be allowed to join the session.</p>`,

      bodyText: `Hello! {{${NV.FULL_NAME.alias}}}

      Thank you for confirming your attendance. Your seat is reserved, and we're very much looking forward to seeing you there.
      
      Session: {{${NV.SESSION_NAME.alias}}}
      Start Date/Time: {{${NV.SESSION_START_DATETIME.alias}}}
      End Date/Time: {{${NV.SESSION_END_DATETIME.alias}}}
      Instructor: {{${NV.INSTRUCTOR_NAME.alias}}}
      Venue: {{${NV.LOCATION_NAME.alias}}}
      
      Please be informed that pre-requisite coursework is required in some courses. In the event that we detect that you have not passed the previous course, we apologize to cancel your registration for this course and recommend you choose a new schedule at "My Dashboard" in YourNextU platform.
      
      Important Information
      1. Identification card, government official card, employee card (with photo and full name) or government-issued card is required to verify identity at the registration point.
      2. Vaccination Certificate or Card is required.
      3. For those who have not yet received a full vaccination, you must provide your COVID-19 test result (RT-PCR or Antigen Test Kit) issued within 7 days.
      4. Please be on time. Participants that enter late will not be allowed to join the session.`,
    },

    th: {
      subject: `YourNextU: ยืนยันการลงทะเบียนคลาสเรียน {{${NV.SESSION_NAME.alias}}}`,

      bodyHTML: `<p><strong>สวัสดีคุณ {{${NV.FULL_NAME.alias}}}</strong></p>

      <p>ขอขอบคุณสำหรับการสำรองที่นั่ง คุณสามารถดูรายละเอียดการเรียนได้ตามข้อมูลดังต่อไปนี้:</p>
      
      <p>ชื่อคลาสเรียน: {{${NV.SESSION_NAME.alias}}}<br />
      วันและเวลาเริ่ม: {{${NV.SESSION_START_DATETIME.alias}}}<br />
      วันและเวลาจบ: {{${NV.SESSION_END_DATETIME.alias}}}<br />
      วิทยากร: {{${NV.INSTRUCTOR_NAME.alias}}}<br />
      สถานที่: {{${NV.LOCATION_NAME.alias}}}</p>
      
      <p>ทั้งนี้เนื่องจากบางหลักสูตรของเราเป็นกลุ่มของหลักสูตรที่เนื้อหามีความต่อเนื่องกัน ดังนั้นหากมีการตรวจพบว่าท่านไม่ได้ผ่านการเรียนหลักสูตรก่อนหน้ามาก่อน ทางเราขออภัยที่ต้องยกเลิกการลงทะเบียนเรียนหลักสูตรนี้ของท่าน และขอแนะนำให้ท่านสมาชิกเข้าไปเลือกเวลาเรียนใหม่ ได้ที่ ”แดชบอร์ดของฉัน”</p>
      
      <p><strong>กรุณาเตรียม</strong><br />
      1. บัตรประชาชน บัตรข้าราชการ บัตรพนักงาน (ที่มีรูปถ่ายและชื่อ-นามสกุล) หรือบัตรที่ออกโดยภาครัฐเพื่อยืนยันตัวตน ณ จุดลงทะเบียน<br />
      2. ผลรับรองการฉีดวัคซีนผ่าน Digital Health Pass หรือ Application หมอพร้อม หรือใช้เอกสารใบรับรองผลการฉีดวัคซีน (อย่างใดอย่างหนึ่ง)<br />
      3. สำหรับท่านที่ยังได้รับวัคซีนไม่ครบ สามารถแสดงใบรับรองประวัติผลการตรวจหาเชื้อโควิด-19 แบบ PCR หรือ ATK ที่เป็นลบภายในระยะเวลาไม่เกิน 7 วัน (ทั้งแบบเอกสารและภาพถ่ายที่เห็นวันที่ตรวจและผลเป็นลบชัดเจน)<br />
      4. กรุณาเผื่อเวลาในการเดินทางเนื่องจากคลาสเริ่มตรงเวลา หากมาสายเจ้าหน้าที่ขอสงวนสิทธิ์ในการเข้าห้องเรียน</p>`,

      bodyText: `สวัสดีคุณ {{${NV.FULL_NAME.alias}}}

      ขอขอบคุณสำหรับการสำรองที่นั่ง คุณสามารถดูรายละเอียดการเรียนได้ตามข้อมูลดังต่อไปนี้:
      
      ชื่อคลาสเรียน: {{${NV.SESSION_NAME.alias}}}
      วันและเวลาเริ่ม: {{${NV.SESSION_START_DATETIME.alias}}}
      วันและเวลาจบ: {{${NV.SESSION_END_DATETIME.alias}}}
      วิทยากร: {{${NV.INSTRUCTOR_NAME.alias}}}
      สถานที่: {{${NV.LOCATION_NAME.alias}}}
      
      ทั้งนี้เนื่องจากบางหลักสูตรของเราเป็นกลุ่มของหลักสูตรที่เนื้อหามีความต่อเนื่องกัน ดังนั้นหากมีการตรวจพบว่าท่านไม่ได้ผ่านการเรียนหลักสูตรก่อนหน้ามาก่อน ทางเราขออภัยที่ต้องยกเลิกการลงทะเบียนเรียนหลักสูตรนี้ของท่าน และขอแนะนำให้ท่านสมาชิกเข้าไปเลือกเวลาเรียนใหม่ ได้ที่ ”แดชบอร์ดของฉัน”
      
      กรุณาเตรียม
      1. บัตรประชาชน บัตรข้าราชการ บัตรพนักงาน (ที่มีรูปถ่ายและชื่อ-นามสกุล) หรือบัตรที่ออกโดยภาครัฐเพื่อยืนยันตัวตน ณ จุดลงทะเบียน
      2. ผลรับรองการฉีดวัคซีนผ่าน Digital Health Pass หรือ Application หมอพร้อม หรือใช้เอกสารใบรับรองผลการฉีดวัคซีน (อย่างใดอย่างหนึ่ง)
      3. สำหรับท่านที่ยังได้รับวัคซีนไม่ครบ สามารถแสดงใบรับรองประวัติผลการตรวจหาเชื้อโควิด-19 แบบ PCR หรือ ATK ที่เป็นลบภายในระยะเวลาไม่เกิน 7 วัน (ทั้งแบบเอกสารและภาพถ่ายที่เห็นวันที่ตรวจและผลเป็นลบชัดเจน)
      4. กรุณาเผื่อเวลาในการเดินทางเนื่องจากคลาสเริ่มตรงเวลา หากมาสายเจ้าหน้าที่ขอสงวนสิทธิ์ในการเข้าห้องเรียน`,
    },
  },

  [EmailNotificationSubCategoryKey.REMINDER_BOOK_SESSION_VIRTUAL]: {
    title: 'Virtual - Session Reminder',

    availableVariables: [
      NV.SESSION_NAME,
      NV.FULL_NAME,
      NV.SESSION_START_DATETIME,
      NV.SESSION_END_DATETIME,
      NV.INSTRUCTOR_NAME,
      NV.SESSION_WAITING_ROOM_LINK,
      NV.COURSE_DETAIL_LINK,
    ],

    en: {
      subject: `YourNextU: Reminder to join {{${NV.SESSION_NAME.alias}}} on {{${NV.SESSION_START_DATE.alias}}}`,

      bodyHTML: `<p><strong>Hello! {{${NV.FULL_NAME.alias}}}</strong></p>

      <p>Reminder to join the session as booking details below:</p>
      
      <p>Session: {{${NV.SESSION_NAME.alias}}}<br />
      Start Date/Time: {{${NV.SESSION_START_DATETIME.alias}}}<br />
      End Date/Time: {{${NV.SESSION_END_DATETIME.alias}}}<br />
      Instructor: {{${NV.INSTRUCTOR_NAME.alias}}}<br />
      Link: {{${NV.SESSION_WAITING_ROOM_LINK.alias}}}</p>
      
      <p><strong>Important note</strong><br />
      Please join the class 20 minutes before the session starts, and log-in before joining the session. Participants that enter late will not be allowed to join the session.</p>
      
      <p>Click on the link below to go to the course page and don't forget to download the course materials for the session.<br />
      <strong>{{${NV.COURSE_DETAIL_LINK.alias}}}</strong></p>`,

      bodyText: `Hello! {{${NV.FULL_NAME.alias}}}

      Reminder to join the session as booking details below:
      
      Session: {{${NV.SESSION_NAME.alias}}}
      Start Date/Time: {{${NV.SESSION_START_DATETIME.alias}}}
      End Date/Time: {{${NV.SESSION_END_DATETIME.alias}}}
      Instructor: {{${NV.INSTRUCTOR_NAME.alias}}}
      Link: {{${NV.SESSION_WAITING_ROOM_LINK.alias}}}
      
      Important note
      Please join the class 20 minutes before the session starts, and log-in before joining the session. Participants that enter late will not be allowed to join the session.
      
      Click on the link below to go to the course page and don't forget to download the course materials for the session.
      {{${NV.COURSE_DETAIL_LINK.alias}}}`,
    },

    th: {
      subject: `YourNextU: แจ้งเตือนการลงทะเบียนเรียน {{${NV.SESSION_NAME.alias}}} {{${NV.SESSION_START_DATE.alias}}}`,

      bodyHTML: `<p><strong>สวัสดีคุณ {{${NV.FULL_NAME.alias}}}</strong></p>

      <p>YourNextU ขอแจ้งเตือนการลงทะเบียนเรียน โดยคุณสามารถตรวจสอบรายละเอียดการเรียนได้ตามข้อมูลดังต่อไปนี้:<p>
      
      <p>ชื่อคลาสเรียน: {{${NV.SESSION_NAME.alias}}}<br />
      วันและเวลาเริ่ม: {{${NV.SESSION_START_DATETIME.alias}}}<br />
      วันและเวลาจบ: {{${NV.SESSION_END_DATETIME.alias}}}<br />
      วิทยากร: {{${NV.INSTRUCTOR_NAME.alias}}}<br />
      ลิงก์เข้าเรียน: {{${NV.SESSION_WAITING_ROOM_LINK.alias}}}</p>
      
      <p><strong>หมายเหตุ:</strong><br />
      - กรุณาเข้าร่วมคลาส 20 นาทีก่อนเวลาเริ่มเรียน หากขอเข้าห้องเรียนสายเกินกว่าเวลาที่กำหนด เจ้าหน้าขอสงวนสิทธิ์ในการเข้าเรียน</p>
      
      <p>กดที่ลิงก์ด้านล่างเพื่อไปที่หลักสูตร และอย่าลืมเข้าไปดาวน์โหลดเอกสารการประกอบการเรียนที่หัวข้อ Material<br />
      <strong>{{${NV.COURSE_DETAIL_LINK.alias}}}</strong></p>`,

      bodyText: `สวัสดีคุณ {{${NV.FULL_NAME.alias}}}

      YourNextU ขอแจ้งเตือนการลงทะเบียนเรียน โดยคุณสามารถตรวจสอบรายละเอียดการเรียนได้ตามข้อมูลดังต่อไปนี้:
      
      ชื่อคลาสเรียน: {{${NV.SESSION_NAME.alias}}}
      วันและเวลาเริ่ม: {{${NV.SESSION_START_DATETIME.alias}}}
      วันและเวลาจบ: {{${NV.SESSION_END_DATETIME.alias}}}
      วิทยากร: {{${NV.INSTRUCTOR_NAME.alias}}}
      ลิงก์เข้าเรียน: {{${NV.SESSION_WAITING_ROOM_LINK.alias}}}
      
      หมายเหตุ:
      - กรุณาเข้าร่วมคลาส 20 นาทีก่อนเวลาเริ่มเรียน หากขอเข้าห้องเรียนสายเกินกว่าเวลาที่กำหนด เจ้าหน้าขอสงวนสิทธิ์ในการเข้าเรียน
      
      กดที่ลิงก์ด้านล่างเพื่อไปที่หลักสูตร และอย่าลืมเข้าไปดาวน์โหลดเอกสารการประกอบการเรียนที่หัวข้อ Material 
      {{${NV.COURSE_DETAIL_LINK.alias}}}`,
    },
  },

  [EmailNotificationSubCategoryKey.REMINDER_BOOK_SESSION_F2F]: {
    title: 'F2F - Session Reminder',

    availableVariables: [
      NV.SESSION_NAME,
      NV.FULL_NAME,
      NV.SESSION_START_DATETIME,
      NV.SESSION_END_DATETIME,
      NV.INSTRUCTOR_NAME,
      NV.LOCATION_NAME,
    ],

    en: {
      subject: `YourNextU: Reminder to join {{${NV.SESSION_NAME.alias}}} on {{${NV.SESSION_START_DATE.alias}}}`,

      bodyHTML: `<p><strong>Hello! {{${NV.FULL_NAME.alias}}}</strong></p>

      <p>Reminder to join the session as booking details below:</p>
      
      <p>Session: {{${NV.SESSION_NAME.alias}}}<br />
      Start Date/Time: {{${NV.SESSION_START_DATETIME.alias}}}<br />
      End Date/Time: {{${NV.SESSION_END_DATETIME.alias}}}<br />
      Instructor: {{${NV.INSTRUCTOR_NAME.alias}}}<br />
      Venue: {{${NV.LOCATION_NAME.alias}}}</p>
      
      <p>Please be informed that pre-requisite coursework is required in some courses. In the event that we detect that you have not passed the previous course, we apologize to cancel your registration for this course and recommend you choose a new schedule at "My Learning Page" in YourNextU platform.</p>
      
      <p><strong>Important Information</strong><br />
      1. Identification card, government official card, employee card (with photo and full name) or government-issued card is required to verify identity at the registration point.<br />
      2. Vaccination Certificate or Card is required.<br />
      3. For those who have not yet received a full vaccination, you must provide your COVID-19 test result (RT-PCR or Antigen Test Kit) issued within 7 days.<br />
      4. Please be on time. Participants that enter late will not be allowed to join the session.</p>`,

      bodyText: `Hello! {{${NV.FULL_NAME.alias}}}

      Reminder to join the session as booking details below:
      
      Session: {{${NV.SESSION_NAME.alias}}}
      Start Date/Time: {{${NV.SESSION_START_DATETIME.alias}}}
      End Date/Time: {{${NV.SESSION_END_DATETIME.alias}}}
      Instructor: {{${NV.INSTRUCTOR_NAME.alias}}}
      Venue: {{${NV.LOCATION_NAME.alias}}}
      
      Please be informed that pre-requisite coursework is required in some courses. In the event that we detect that you have not passed the previous course, we apologize to cancel your registration for this course and recommend you choose a new schedule at "My Learning Page" in YourNextU platform.
      
      Important Information
      1. Identification card, government official card, employee card (with photo and full name) or government-issued card is required to verify identity at the registration point.
      2. Vaccination Certificate or Card is required.
      3. For those who have not yet received a full vaccination, you must provide your COVID-19 test result (RT-PCR or Antigen Test Kit) issued within 7 days.
      4. Please be on time. Participants that enter late will not be allowed to join the session.`,
    },

    th: {
      subject: `YourNextU:  แจ้งเตือนการลงทะเบียนเรียน {{${NV.SESSION_NAME.alias}}} {{${NV.SESSION_START_DATE.alias}}}`,

      bodyHTML: `<p><strong>สวัสดีคุณ {{${NV.FULL_NAME.alias}}}</strong></p>

      <p>YourNextU ขอแจ้งเตือนการลงทะเบียนเรียน โดยคุณสามารถตรวจสอบรายละเอียดการเรียนได้ตามข้อมูลดังต่อไปนี้:</p>
      
      <p>ชื่อคลาสเรียน: {{${NV.SESSION_NAME.alias}}}<br />
      วันและเวลาเริ่ม: {{${NV.SESSION_START_DATETIME.alias}}}<br />
      วันและเวลาจบ: {{${NV.SESSION_END_DATETIME.alias}}}<br />
      วิทยากร: {{${NV.INSTRUCTOR_NAME.alias}}}<br />
      สถานที่: {{${NV.LOCATION_NAME.alias}}}</p>
      
      <p>ทั้งนี้เนื่องจากบางหลักสูตรของเราเป็นกลุ่มของหลักสูตรที่เนื้อหามีความต่อเนื่องกัน ดังนั้นหากมีการตรวจพบว่าท่านไม่ได้ผ่านการเรียนหลักสูตรก่อนหน้ามาก่อน ทางเราขออภัยที่ต้องยกเลิกการลงทะเบียนเรียนหลักสูตรนี้ของท่าน และขอแนะนำให้ท่านสมาชิกเข้าไปเลือกเวลาเรียนใหม่ ได้ที่ ”หน้าการเรียนรู้ของฉัน”</p>
      
      <p><strong>กรุณาเตรียม</strong><br />
      1. บัตรประชาชน บัตรข้าราชการ บัตรพนักงาน (ที่มีรูปถ่ายและชื่อ-นามสกุล) หรือบัตรที่ออกโดยภาครัฐเพื่อยืนยันตัวตน ณ จุดลงทะเบียน<br />
      2. ผลรับรองการฉีดวัคซีนผ่าน Digital Health Pass หรือ Application หมอพร้อม หรือใช้เอกสารใบรับรองผลการฉีดวัคซีน (อย่างใดอย่างหนึ่ง)<br />
      3. สำหรับท่านที่ยังได้รับวัคซีนไม่ครบ สามารถแสดงใบรับรองประวัติผลการตรวจหาเชื้อโควิด-19 แบบ PCR หรือ ATK ที่เป็นลบภายในระยะเวลาไม่เกิน 7 วัน (ทั้งแบบเอกสารและภาพถ่ายที่เห็นวันที่ตรวจและผลเป็นลบชัดเจน)<br />
      4. กรุณาเผื่อเวลาในการเดินทางเนื่องจากคลาสเริ่มตรงเวลา หากมาสายเจ้าหน้าที่ขอสงวนสิทธิ์ในการเข้าห้องเรียน</p>`,

      bodyText: `สวัสดีคุณ {{${NV.FULL_NAME.alias}}}

      YourNextU ขอแจ้งเตือนการลงทะเบียนเรียน โดยคุณสามารถตรวจสอบรายละเอียดการเรียนได้ตามข้อมูลดังต่อไปนี้:
      
      ชื่อคลาสเรียน: {{${NV.SESSION_NAME.alias}}}
      วันและเวลาเริ่ม: {{${NV.SESSION_START_DATETIME.alias}}}
      วันและเวลาจบ: {{${NV.SESSION_END_DATETIME.alias}}}
      วิทยากร: {{${NV.INSTRUCTOR_NAME.alias}}}
      สถานที่: {{${NV.LOCATION_NAME.alias}}}
      
      ทั้งนี้เนื่องจากบางหลักสูตรของเราเป็นกลุ่มของหลักสูตรที่เนื้อหามีความต่อเนื่องกัน ดังนั้นหากมีการตรวจพบว่าท่านไม่ได้ผ่านการเรียนหลักสูตรก่อนหน้ามาก่อน ทางเราขออภัยที่ต้องยกเลิกการลงทะเบียนเรียนหลักสูตรนี้ของท่าน และขอแนะนำให้ท่านสมาชิกเข้าไปเลือกเวลาเรียนใหม่ ได้ที่ ”หน้าการเรียนรู้ของฉัน”
      
      กรุณาเตรียม
      1. บัตรประชาชน บัตรข้าราชการ บัตรพนักงาน (ที่มีรูปถ่ายและชื่อ-นามสกุล) หรือบัตรที่ออกโดยภาครัฐเพื่อยืนยันตัวตน ณ จุดลงทะเบียน
      2. ผลรับรองการฉีดวัคซีนผ่าน Digital Health Pass หรือ Application หมอพร้อม หรือใช้เอกสารใบรับรองผลการฉีดวัคซีน (อย่างใดอย่างหนึ่ง)
      3. สำหรับท่านที่ยังได้รับวัคซีนไม่ครบ สามารถแสดงใบรับรองประวัติผลการตรวจหาเชื้อโควิด-19 แบบ PCR หรือ ATK ที่เป็นลบภายในระยะเวลาไม่เกิน 7 วัน (ทั้งแบบเอกสารและภาพถ่ายที่เห็นวันที่ตรวจและผลเป็นลบชัดเจน)
      4. กรุณาเผื่อเวลาในการเดินทางเนื่องจากคลาสเริ่มตรงเวลา หากมาสายเจ้าหน้าที่ขอสงวนสิทธิ์ในการเข้าห้องเรียน`,
    },
  },

  [EmailNotificationSubCategoryKey.BOOKING_CANCELLATION]: {
    title: 'Booking Cancellation',

    availableVariables: [
      NV.SESSION_NAME,
      NV.FULL_NAME,
      NV.SESSION_START_DATETIME,
      NV.INSTRUCTOR_NAME,
      NV.SESSION_REGISTERED_DATETIME,
      NV.SESSION_CANCELLED_DATETIME,
    ],

    en: {
      subject: `YourNextU: Booking cancellation {{${NV.SESSION_NAME.alias}}} on {{${NV.SESSION_START_DATE.alias}}}`,

      bodyHTML: `<p><strong>Hello! {{${NV.FULL_NAME.alias}}}</strong></p>

      <p>We are sorry to hear you won't be able to join the upcoming session, however, thank you for letting us know. You can find alternative and upcoming sessions on our platform at anytime and we look forward to seeing you soon!</p>
      
      <p>Session: {{${NV.SESSION_NAME.alias}}}<br />
      Start Date/Time: {{${NV.SESSION_START_DATETIME.alias}}}<br />
      Instructor: {{${NV.INSTRUCTOR_NAME.alias}}}</p>
      
      <p>Registered on: {{${NV.SESSION_REGISTERED_DATETIME.alias}}}<br />
      Cancelled on: {{${NV.SESSION_CANCELLED_DATETIME.alias}}}</p>`,

      bodyText: `Hello! {{${NV.FULL_NAME.alias}}}

      We are sorry to hear you won't be able to join the upcoming session, however, thank you for letting us know. You can find alternative and upcoming sessions on our platform at anytime and we look forward to seeing you soon!
      
      Session: {{${NV.SESSION_NAME.alias}}}
      Start Date/Time: {{${NV.SESSION_START_DATETIME.alias}}}
      Instructor: {{${NV.INSTRUCTOR_NAME.alias}}}
      
      Registered on: {{${NV.SESSION_REGISTERED_DATETIME.alias}}}
      Cancelled on: {{${NV.SESSION_CANCELLED_DATETIME.alias}}}`,
    },

    th: {
      subject: `YourNextU: ยกเลิกการจอง {{${NV.SESSION_NAME.alias}}} {{${NV.SESSION_START_DATE.alias}}}`,

      bodyHTML: `<p><strong>สวัสดีคุณ {{${NV.FULL_NAME.alias}}}</strong></p>

      <p>การลงทะเบียนในคลาสต่อไปนี้ได้ถูกยกเลิกตามคำขอของคุณเรียบร้อยแล้ว</p>
      
      <p>ชื่อคลาสเรียน: {{${NV.SESSION_NAME.alias}}}<br />
      วันและเวลาเริ่ม: {{${NV.SESSION_START_DATETIME.alias}}}<br />
      วิทยากร: {{${NV.INSTRUCTOR_NAME.alias}}}</p>
      
      <p>ลงทะเบียนเมื่อ: {{${NV.SESSION_REGISTERED_DATETIME.alias}}}<br />
      ยกเลิกเมื่อ: {{${NV.SESSION_CANCELLED_DATETIME.alias}}}</p>
      
      <p>ทางเราขออภัยในความไม่สะดวกใดใดที่เกิดขึ้นมา ณ ที่นี้</p>`,

      bodyText: `สวัสดีคุณ {{${NV.FULL_NAME.alias}}}

      การลงทะเบียนในคลาสต่อไปนี้ได้ถูกยกเลิกตามคำขอของคุณเรียบร้อยแล้ว
      
      ชื่อคลาสเรียน: {{${NV.SESSION_NAME.alias}}}
      วันและเวลาเริ่ม: {{${NV.SESSION_START_DATETIME.alias}}}
      วิทยากร: {{${NV.INSTRUCTOR_NAME.alias}}}
      
      ลงทะเบียนเมื่อ: {{${NV.SESSION_REGISTERED_DATETIME.alias}}}
      ยกเลิกเมื่อ: {{${NV.SESSION_CANCELLED_DATETIME.alias}}}
      
      ทางเราขออภัยในความไม่สะดวกใดใดที่เกิดขึ้นมา ณ ที่นี้`,
    },
  },

  [EmailNotificationSubCategoryKey.BOOKING_CANCELLATION_BY_ADMIN]: {
    title: 'Session Cancelled by Admin',

    availableVariables: [
      NV.SESSION_NAME,
      NV.FULL_NAME,
      NV.SESSION_START_DATETIME,
      NV.INSTRUCTOR_NAME,
      NV.SESSION_CANCELLED_DATETIME,
    ],

    en: {
      subject: `YourNextU: Session cancel: {{${NV.SESSION_NAME.alias}}} {{${NV.SESSION_START_DATE.alias}}}`,

      bodyHTML: `<p><strong>Hello! {{${NV.FULL_NAME.alias}}}</strong></p>

      <p>We're apologize to inform you that the session below need to be cancelled. We made this difficult decision to cancel because the number of participants did not reach the minimum required.</p>
      
      <p>We understand that this change may cause great inconvenience for you and are sincerely sorry.</p>
      
      <p>Session: {{${NV.SESSION_NAME.alias}}}<br />
      Start Date/Time: {{${NV.SESSION_START_DATETIME.alias}}}<br />
      Instructor: {{${NV.INSTRUCTOR_NAME.alias}}}<br />
      Cancelled on: {{${NV.SESSION_CANCELLED_DATETIME.alias}}}</p>
      
      <p>Should you need further assistance regarding new schedule, please reply back to this email with new schedule date/time or you can also book by yourself from this link {{${NV.OUTLINE_SCHEDULE_LINK.alias}}}</p> 
      
      <p>Thank you for your understanding and once again we sincerely apologise for the inconvenience caused.</p>`,

      bodyText: `Hello! {{${NV.FULL_NAME.alias}}}

      We're apologize to inform you that the session below need to be cancelled. We made this difficult decision to cancel because the number of participants did not reach the minimum required.
      
      We understand that this change may cause great inconvenience for you and are sincerely sorry.
      
      Session: {{${NV.SESSION_NAME.alias}}}
      Start Date/Time: {{${NV.SESSION_START_DATETIME.alias}}}
      Instructor: {{${NV.INSTRUCTOR_NAME.alias}}}
      Cancelled on: {{${NV.SESSION_CANCELLED_DATETIME.alias}}}
      
      Should you need further assistance regarding new schedule, please reply back to this email with new schedule date/time or you can also book by yourself from this link {{${NV.OUTLINE_SCHEDULE_LINK.alias}}} 
      
      Thank you for your understanding and once again we sincerely apologise for the inconvenience caused.`,
    },

    th: {
      subject: `YourNextU: แจ้งยกเลิกคลาส {{${NV.SESSION_NAME.alias}}} {{${NV.SESSION_START_DATE.alias}}}`,

      bodyHTML: `<p><strong>สวัสดีคุณ {{${NV.FULL_NAME.alias}}}</strong></p>

      <p>ทางเราขออภัยที่ต้องแจ้งให้ท่านทราบว่าเรามีความจำเป็นอย่างยิ่งต้องยกเลิกคลาสที่ท่านได้ลงทะเบียนไว้ตามรายละเอียดด้านล่าง เนื่องจากจำนวนผู้เรียนในหลักสูตรดังกล่าวไม่ถึงจำนวนขั้นต่ำที่กำหนด</p>
      
      <p>ชื่อคลาสเรียน: {{${NV.SESSION_NAME.alias}}}<br />
      วันและเวลาเริ่ม: {{${NV.SESSION_START_DATETIME.alias}}}<br />
      ผู้สอน: {{${NV.INSTRUCTOR_NAME.alias}}}<br />
      ยกเลิกเมื่อ: {{${NV.SESSION_CANCELLED_DATETIME.alias}}}</p>
      
      <p>หากท่านสมาชิกต้องการความช่วยเหลือในส่วนของการลงทะเบียนใหม่ ท่านสามารถตอบกลับมายังอีเมลฉบับนี้พร้อมทั้งระบุวัน และเวลาที่ต้องการเข้าเรียน โดยตรวจสอบได้จาก  {{${NV.OUTLINE_SCHEDULE_LINK.alias}}} หลังจากการลงทะเบียนใหม่เสร็จสิ้น ท่านจะได้รับอีเมลยืนยันจากระบบอีกครั้ง</p>
      
      <p>ทางเราขออภัยในความไม่สะดวกที่เกิดขึ้นเป็นอย่างสูง</p>`,

      bodyText: `สวัสดีคุณ {{${NV.FULL_NAME.alias}}}

      ทางเราขออภัยที่ต้องแจ้งให้ท่านทราบว่าเรามีความจำเป็นอย่างยิ่งต้องยกเลิกคลาสที่ท่านได้ลงทะเบียนไว้ตามรายละเอียดด้านล่าง เนื่องจากจำนวนผู้เรียนในหลักสูตรดังกล่าวไม่ถึงจำนวนขั้นต่ำที่กำหนด
      
      ชื่อคลาสเรียน: {{${NV.SESSION_NAME.alias}}}
      วันและเวลาเริ่ม: {{${NV.SESSION_START_DATETIME.alias}}}
      ผู้สอน: {{${NV.INSTRUCTOR_NAME.alias}}}
      ยกเลิกเมื่อ: {{${NV.SESSION_CANCELLED_DATETIME.alias}}}
      
      หากท่านสมาชิกต้องการความช่วยเหลือในส่วนของการลงทะเบียนใหม่ ท่านสามารถตอบกลับมายังอีเมลฉบับนี้พร้อมทั้งระบุวัน และเวลาที่ต้องการเข้าเรียน โดยตรวจสอบได้จาก  {{${NV.OUTLINE_SCHEDULE_LINK.alias}}} หลังจากการลงทะเบียนใหม่เสร็จสิ้น ท่านจะได้รับอีเมลยืนยันจากระบบอีกครั้ง
      
      ทางเราขออภัยในความไม่สะดวกที่เกิดขึ้นเป็นอย่างสูง`,
    },
  },

  [EmailNotificationSubCategoryKey.BOOKING_SCHEDULE_CHANGED]: {
    title: 'Schedule Changed',

    availableVariables: [
      NV.SESSION_NAME,
      NV.FULL_NAME,
      NV.SESSION_START_DATETIME,
      NV.INSTRUCTOR_NAME,
      NV.OLD_SESSION_START_DATETIME,
    ],

    en: {
      subject: `YourNextU: Session schedule changed {{${NV.COURSE_NAME.alias}}} {{${NV.SESSION_START_DATE.alias}}}`,

      bodyHTML: `<p><strong>Hello! {{${NV.FULL_NAME.alias}}}</strong></p>

      <p>We are apologize to inform you that we need to change schedule of one session that you booked as below.</p>
      
      <p>Session: {{${NV.SESSION_NAME.alias}}}<br />
      Old start date/time: {{${NV.OLD_SESSION_START_DATETIME.alias}}}<br />
      New start date/time: {{${NV.SESSION_START_DATETIME.alias}}}<br />
      Instructor: {{${NV.INSTRUCTOR_NAME.alias}}}</p>
      
      <p>If you are not available per this new date/time, you can cancel this booking and enroll again at your convenient date/time from this link {{${NV.OUTLINE_SCHEDULE_LINK.alias}}}</p>
      
      <p>Sincerely apologize,</p>`,

      bodyText: `Hello! {{${NV.FULL_NAME.alias}}}

      We are apologize to inform you that we need to change schedule of one session that you booked as below.
      
      Session: {{${NV.SESSION_NAME.alias}}}
      Old start date/time: {{${NV.OLD_SESSION_START_DATETIME.alias}}}
      New start date/time: {{${NV.SESSION_START_DATETIME.alias}}}
      Instructor: {{${NV.INSTRUCTOR_NAME.alias}}}
      
      If you are not available per this new date/time, you can cancel this booking and enroll again at your convenient date/time from this link {{${NV.OUTLINE_SCHEDULE_LINK.alias}}}
      
      Sincerely apologize,`,
    },

    th: {
      subject: `YourNextU: แจ้งเลื่อนวันเข้าเรียน {{${NV.COURSE_NAME.alias}}} {{${NV.SESSION_START_DATE.alias}}}`,

      bodyHTML: `<p><strong>สวัสดีคุณ {{${NV.FULL_NAME.alias}}}</strong></p>

      <p>ทางเราขออภัยที่ต้องแจ้งให้ท่านทราบว่าเรามีความจำเป็นต้องเลื่อนวันเข้าเรียนของคลาสที่ท่านได้ลงทะเบียนไว้ ตามรายละเอียดดังนี้</p>
      
      <p>ชื่อคลาสเรียน: {{${NV.SESSION_NAME.alias}}}<br />
      วันและเวลาเดิม: {{${NV.OLD_SESSION_START_DATETIME.alias}}}<br />
      วันและเวลาใหม่: {{${NV.SESSION_START_DATETIME.alias}}}<br />
      วิทยากร: {{${NV.INSTRUCTOR_NAME.alias}}}</p>
      
      <p>อย่างไรก็ตามหากท่านสมาชิกไม่สะดวกเข้าเรียนในวันและเวลาดังกล่าว ท่านสามารถตรวจสอบตารางเรียนเพิ่มเติมในวันอื่นๆ ได้จากลิงก์นี้  {{${NV.OUTLINE_SCHEDULE_LINK.alias}}}</p>
      
      <p>ทางเราขออภัยในความไม่สะดวกที่เกิดขึ้นเป็นอย่างสูง</p>`,

      bodyText: `สวัสดีคุณ {{${NV.FULL_NAME.alias}}}

      ทางเราขออภัยที่ต้องแจ้งให้ท่านทราบว่าเรามีความจำเป็นต้องเลื่อนวันเข้าเรียนของคลาสที่ท่านได้ลงทะเบียนไว้ ตามรายละเอียดดังนี้ 
      
      ชื่อคลาสเรียน: {{${NV.SESSION_NAME.alias}}}
      วันและเวลาเดิม: {{${NV.OLD_SESSION_START_DATETIME.alias}}}
      วันและเวลาใหม่: {{${NV.SESSION_START_DATETIME.alias}}}
      วิทยากร: {{${NV.INSTRUCTOR_NAME.alias}}}
      
      อย่างไรก็ตามหากท่านสมาชิกไม่สะดวกเข้าเรียนในวันและเวลาดังกล่าว ท่านสามารถตรวจสอบตารางเรียนเพิ่มเติมในวันอื่นๆ ได้จากลิงก์นี้  {{${NV.OUTLINE_SCHEDULE_LINK.alias}}}
      
      ทางเราขออภัยในความไม่สะดวกที่เกิดขึ้นเป็นอย่างสูง`,
    },
  },

  [EmailNotificationSubCategoryKey.CERTIFICATE_UNLOCKED]: {
    title: 'Certificate Unlocked',

    availableVariables: [
      NV.CERTIFICATE_NAME,
      NV.FULL_NAME,
      NV.CERTIFICATE_LINK,
    ],

    en: {
      subject: `YourNextU: Congratulations Your Certificate {{${NV.CERTIFICATE_NAME.alias}}} is ready`,

      bodyHTML: `<p><strong>Congratuations to {{${NV.FULL_NAME.alias}}} !</strong></p>

      <p>Your certificate of {{${NV.CERTIFICATE_NAME.alias}}} has been unlocked.<br />
      You can download e-certificate from {{${NV.CERTIFICATE_LINK.alias}}}</p>`,

      bodyText: `Congratuations to {{${NV.FULL_NAME.alias}}} !

      Your certificate of {{${NV.CERTIFICATE_NAME.alias}}} has been unlocked.
      You can download e-certificate from {{${NV.CERTIFICATE_LINK.alias}}}`,
    },

    th: {
      subject: `YourNextU: Congratulations Your Certificate {{${NV.CERTIFICATE_NAME.alias}}} is ready`,

      bodyHTML: `<p><strong>ขอแสดงความยินดีกับคุณ {{${NV.FULL_NAME.alias}}} !</strong></p>

      <p>ใบรับรอง {{${NV.CERTIFICATE_NAME.alias}}} ได้ถูกปลดล็อกแล้ว<br />
      คุณสามารถดาวโหลด e-certificate ได้ที่ {{${NV.CERTIFICATE_LINK.alias}}}</p>`,

      bodyText: `ขอแสดงความยินดีกับคุณ {{${NV.FULL_NAME.alias}}} !

      ใบรับรอง {{${NV.CERTIFICATE_NAME.alias}}} ได้ถูกปลดล็อกแล้ว
      คุณสามารถดาวโหลด e-certificate ได้ที่ {{${NV.CERTIFICATE_LINK.alias}}}`,
    },
  },

  [EmailNotificationSubCategoryKey.REMINDER_COMPLETE_ASSIGNED_COURSE]: {
    title: 'Remind to complete required course',

    availableVariables: [
      NV.FULL_NAME,
      NV.MEMBERSHIP_EXPIRY_DATE,
      NV.COURSE_LIST,
      NV.DASHBOARD_COURSES_LINK,
    ],

    en: {
      subject: 'YourNextU: Reminder to complete the required courses',

      bodyHTML: `<p><strong>Hello! {{${NV.FULL_NAME.alias}}}</strong></p>
      <p>Reminder to complete the required courses below by {{${NV.MEMBERSHIP_EXPIRY_DATE.alias}}}</p>
      <p>{{${NV.COURSE_LIST.alias}}}</p>
      <p>You can start the course or enroll a session for each course from <a href="{{${NV.DASHBOARD_COURSES_LINK.alias}}}">{{${NV.DASHBOARD_COURSES_LINK.alias}}}</a></p>`,

      bodyText: `Hello! {{${NV.FULL_NAME.alias}}}
      Reminder to complete the required courses below by {{${NV.MEMBERSHIP_EXPIRY_DATE.alias}}}
      {{${NV.COURSE_LIST.alias}}}
      You can start the course or enroll a session for each course from {{${NV.DASHBOARD_COURSES_LINK.alias}}}`,
    },

    th: {
      subject: 'YourNextU: แจ้งเตือนหลักสูตรที่จำเป็นต้องเรียน',

      bodyHTML: `<p><strong>สวัสดีคุณ {{${NV.FULL_NAME.alias}}}</strong></p>
      <p>YourNextU ขอแจ้งให้ทราบว่าคุณมีหลักสูตรที่จำเป็นต้องเรียนให้จบก่อน {{${NV.MEMBERSHIP_EXPIRY_DATE.alias}}} ดังนี้:</p>
      <p>{{${NV.COURSE_LIST.alias}}}</p>
      <p>คุณสามารถเริ่มเรียน หรือลงทะเบียนเรียนในแต่ละหลักสูตรได้จากลิงก์นี้ <a href="{{${NV.DASHBOARD_COURSES_LINK.alias}}}">{{${NV.DASHBOARD_COURSES_LINK.alias}}}</a></p>`,

      bodyText: `สวัสดีคุณ {{${NV.FULL_NAME.alias}}}
      YourNextU ขอแจ้งให้ทราบว่าคุณมีหลักสูตรที่จำเป็นต้องเรียนให้จบก่อน {{${NV.MEMBERSHIP_EXPIRY_DATE.alias}}} ดังนี้:
      {{${NV.COURSE_LIST.alias}}}
      คุณสามารถเริ่มเรียน หรือลงทะเบียนเรียนในแต่ละหลักสูตรได้จากลิงก์นี้ {{${NV.DASHBOARD_COURSES_LINK.alias}}}`,
    },
  },

  [EmailNotificationSubCategoryKey.REMINDER_COMPLETE_ASSIGNED_LEARNING_TRACK]: {
    title: 'Remind to complete required learning track',

    availableVariables: [
      NV.FULL_NAME,
      NV.MEMBERSHIP_EXPIRY_DATE,
      NV.LEARNING_TRACK_LIST,
      NV.DASHBOARD_LEARNING_TRACKS_LINK,
    ],

    en: {
      subject: 'YourNextU: Reminder to complete the required learning track',
      bodyHTML: `<p><strong>Hello! {{${NV.FULL_NAME.alias}}}</strong></p>
      <p>Reminder to complete the required learning track courses below by {{${NV.MEMBERSHIP_EXPIRY_DATE.alias}}}</p>
      <p>{{${NV.LEARNING_TRACK_LIST.alias}}}</p>
      <p>You can begin the course or enroll a session for each course from <a href="{{${NV.DASHBOARD_LEARNING_TRACKS_LINK.alias}}}">{{${NV.DASHBOARD_LEARNING_TRACKS_LINK.alias}}}</a></p>`,

      bodyText: `Hello! {{${NV.FULL_NAME.alias}}}
      Reminder to complete the required learning track courses below by {{${NV.MEMBERSHIP_EXPIRY_DATE.alias}}}
      {{${NV.LEARNING_TRACK_LIST.alias}}}
      You can begin the course or enroll a session for each course from {{${NV.DASHBOARD_LEARNING_TRACKS_LINK.alias}}}`,
    },

    th: {
      subject: 'YourNextU: แจ้งเตือน Learning track ที่จำเป็นต้องเรียน',

      bodyHTML: `<p><strong>สวัสดีคุณ {{${NV.FULL_NAME.alias}}}</strong></p>
      <p>YourNextU ขอแจ้งให้ทราบว่าคุณมี Learning Track ที่จำเป็นต้องเรียนให้จบก่อน {{${NV.MEMBERSHIP_EXPIRY_DATE.alias}}} ดังนี้:</p>
      <p>{{${NV.LEARNING_TRACK_LIST.alias}}}</p>
      <p>คุณสามารถเริ่มเรียน หรือลงทะเบียนเรียนแต่ละหลักสูตรได้จากลิงก์นี้ <a href="{{${NV.DASHBOARD_LEARNING_TRACKS_LINK.alias}}}">{{${NV.DASHBOARD_LEARNING_TRACKS_LINK.alias}}}</a></p>`,

      bodyText: `สวัสดีคุณ {{${NV.FULL_NAME.alias}}}
      YourNextU ขอแจ้งให้ทราบว่าคุณมี Learning Track ที่จำเป็นต้องเรียนให้จบก่อน {{${NV.MEMBERSHIP_EXPIRY_DATE.alias}}} ดังนี้:
      {{${NV.LEARNING_TRACK_LIST.alias}}}
      คุณสามารถเริ่มเรียน หรือลงทะเบียนเรียนแต่ละหลักสูตรได้จากลิงก์นี้ {{${NV.DASHBOARD_LEARNING_TRACKS_LINK.alias}}}`,
    },
  },

  [EmailNotificationSubCategoryKey.REMINDER_TODO_ASSESSMENT]: {
    title: 'Assessment result required',

    availableVariables: [
      NV.FULL_NAME,
      NV.SESSION_NAME,
      NV.SESSION_START_DATETIME,
      NV.SESSION_END_DATETIME,
      NV.INSTRUCTOR_NAME,
      NV.SESSION_WAITING_ROOM_LINK,
      NV.ASSESSMENT_LINK,
    ],

    en: {
      subject: `YourNextU: Assessment required before joining {{${NV.SESSION_NAME.alias}}}`,

      bodyHTML: `<p><strong>Hello! {{${NV.FULL_NAME.alias}}}</strong></p>

      <p>Reminder to complete assessment before joining the session as booking details below:</p>
      
      <p>Session: {{${NV.SESSION_NAME.alias}}}<br />
      Start Date/Time: {{${NV.SESSION_START_DATETIME.alias}}}<br />
      End Date/Time: {{${NV.SESSION_END_DATETIME.alias}}}<br />
      Instructor: {{${NV.INSTRUCTOR_NAME.alias}}}<br />
      Link: {{${NV.SESSION_WAITING_ROOM_LINK.alias}}}</p>
      
      <p>Click here {{${NV.ASSESSMENT_LINK.alias}}} to do the assessment and download the assessment report.</p>`,

      bodyText: `Hello! {{${NV.FULL_NAME.alias}}}

      Reminder to complete assessment before joining the session as booking details below:
      
      Session: {{${NV.SESSION_NAME.alias}}}
      Start Date/Time: {{${NV.SESSION_START_DATETIME.alias}}}
      End Date/Time: {{${NV.SESSION_END_DATETIME.alias}}}
      Instructor: {{${NV.INSTRUCTOR_NAME.alias}}}
      Link: {{${NV.SESSION_WAITING_ROOM_LINK.alias}}}
      
      Click here {{${NV.ASSESSMENT_LINK.alias}}} to do the assessment and download the assessment report.`,
    },

    th: {
      subject: `YourNextU: ทำแบบทดสอบก่อนเข้าเรียน {{${NV.SESSION_NAME.alias}}}`,

      bodyHTML: `<p><strong>สวัสดีคุณ {{${NV.FULL_NAME.alias}}}</strong></p>

      <p>YourNextU ขอแจ้งเตือนการทำแบบประเมินก่อนเข้าเรียนตามรายละเอียดดังนี้:</p>
      
      <p>ชื่อคลาสเรียน: {{${NV.SESSION_NAME.alias}}}<br />
      วันและเวลาเริ่ม: {{${NV.SESSION_START_DATETIME.alias}}}<br />
      วันและเวลาจบ: {{${NV.SESSION_END_DATETIME.alias}}}<br />
      วิทยากร: {{${NV.INSTRUCTOR_NAME.alias}}}</p>
      
      <p>ลิงก์สำหรับทำแบบประเมินและดาวน์โหลดผลการประเมินก่อนเข้าเรียน {{${NV.ASSESSMENT_LINK.alias}}}</p>`,

      bodyText: `สวัสดีคุณ {{${NV.FULL_NAME.alias}}}

      YourNextU ขอแจ้งเตือนการทำแบบประเมินก่อนเข้าเรียนตามรายละเอียดดังนี้:
      
      ชื่อคลาสเรียน: {{${NV.SESSION_NAME.alias}}}
      วันและเวลาเริ่ม: {{${NV.SESSION_START_DATETIME.alias}}}
      วันและเวลาจบ: {{${NV.SESSION_END_DATETIME.alias}}}
      วิทยากร: {{${NV.INSTRUCTOR_NAME.alias}}}
      
      ลิงก์สำหรับทำแบบประเมินและดาวน์โหลดผลการประเมินก่อนเข้าเรียน {{${NV.ASSESSMENT_LINK.alias}}}`,
    },
  },

  [EmailNotificationSubCategoryKey.REMINDER_ACTIVATE_ACCOUNT]: {
    title: 'Remind to activate account',

    availableVariables: [NV.FULL_NAME, NV.EMAIL, NV.ACCOUNT_ACTIVATION_LINK],

    en: {
      subject: 'Start learning together with YourNextU',

      bodyHTML: `<p><strong>Dear {{${NV.FULL_NAME.alias}}}</strong>,</p>

      <p>Welcome to YourNextU. We are pleased that you decided to become part of our family!</p>
      
      <p><strong>Username: {{${NV.EMAIL.alias}}}</strong></p>
      
      <p>Login to start your journey with 1 easy step</p>
      
      <p>Click on the link below to activate your account and set your password (This link is one-time use and you can see the password creation instructions from the login page.)<br />
      <strong>{{${NV.ACCOUNT_ACTIVATION_LINK.alias}}}</strong></p>`,

      bodyText: `Dear {{${NV.FULL_NAME.alias}}},

      Welcome to YourNextU. We are pleased that you decided to become part of our family!
      
      Username: {{${NV.EMAIL.alias}}}
      
      Login to start your journey with 1 easy step
      
      Click on the link below to activate your account and set your password (This link is one-time use and you can see the password creation instructions from the login page.)
      {{${NV.ACCOUNT_ACTIVATION_LINK.alias}}}`,
    },

    th: {
      subject: 'เริ่มเรียนรู้ไปกับเราที่ YourNextU',

      bodyHTML: `<p><strong>สวัสดีคุณ {{${NV.FULL_NAME.alias}}}</strong></p>

      <p>ยินดีต้อนรับสู่ YourNextU เรายินดีอย่างยิ่งที่คุณตัดสินใจเป็นสมาชิกกับเรา!</p>
      
      <p><strong>Username: {{${NV.EMAIL.alias}}}</strong></p>
      
      <p>เข้าสู่ระบบเพื่อเริ่มต้นเรียน ด้วย 1 ขั้นตอนง่ายๆ</p>
      
      <p>คลิกที่ลิงก์เพื่อเปิดใช้งานบัญชี และตั้งรหัสผ่าน (ลิงก์สามารถกดได้ครั้งเดียว โดยสามารถดูคำแนะนำการตั้งรหัสผ่านใหม่ได้จากหน้าการเข้าสู่ระบบ)<br />
      <strong>{{${NV.ACCOUNT_ACTIVATION_LINK.alias}}}</strong></p>
      
      <p>หากคุณมีข้อสงสัยหรือต้องการความช่วยเหลือ Member Services ของเราพร้อมให้บริการเสมอ<br />
      ขอให้คุณสนุกกับการเรียนรู้ที่ YourNextU</p>`,

      bodyText: `สวัสดีคุณ {{${NV.FULL_NAME.alias}}}

      ยินดีต้อนรับสู่ YourNextU เรายินดีอย่างยิ่งที่คุณตัดสินใจเป็นสมาชิกกับเรา! 
      
      Username: {{${NV.EMAIL.alias}}}
      
      เข้าสู่ระบบเพื่อเริ่มต้นเรียน ด้วย 1 ขั้นตอนง่ายๆ
      
      คลิกที่ลิงก์เพื่อเปิดใช้งานบัญชี และตั้งรหัสผ่าน (ลิงก์สามารถกดได้ครั้งเดียว โดยสามารถดูคำแนะนำการตั้งรหัสผ่านใหม่ได้จากหน้าการเข้าสู่ระบบ)
      {{${NV.ACCOUNT_ACTIVATION_LINK.alias}}}
      
      หากคุณมีข้อสงสัยหรือต้องการความช่วยเหลือ Member Services ของเราพร้อมให้บริการเสมอ
      ขอให้คุณสนุกกับการเรียนรู้ที่ YourNextU`,
    },
  },

  [EmailNotificationSubCategoryKey.REMINDER_BOOKING_AFTER_INACTIVE]: {
    title:
      'Remind to book session after 7 days inactive (last login/7 days from activation date)',

    availableVariables: [
      NV.FULL_NAME,
      NV.DASHBOARD_COURSES_LINK,
      NV.LOGIN_LINK,
    ],

    en: {
      subject: 'YourNextU: We miss you!',

      bodyHTML: `<p>Dear {{${NV.FULL_NAME.alias}}},</p>

      <p>We miss you !</p>
      
      <p>Here are our courses in case you are interested: {{${NV.DASHBOARD_COURSES_LINK.alias}}} or getting back in to your account to complete your learning track here {{${NV.LOGIN_LINK.alias}}}</p>
      
      <p>See you soon!</p>`,

      bodyText: `Dear {{${NV.FULL_NAME.alias}}},

      We miss you !
      
      Here are our courses in case you are interested: {{${NV.DASHBOARD_COURSES_LINK.alias}}} or getting back in to your account to complete your learning track here {{${NV.LOGIN_LINK.alias}}}
      
      See you soon!`,
    },

    th: {
      subject: 'กลับมาเรียนรู้ไปพร้อมๆกับเรา',

      bodyHTML: `<p>สวัสดีคุณ {{${NV.FULL_NAME.alias}}}</p>

      <p>พวกเราคิดถึงคุณ!</p>
      
      <p>YourNextU มีหลักสูตรมากมายให้คุณได้เลือกลงทะเบียนตามรายวิชาที่คุณสนใจ {{${NV.DASHBOARD_COURSES_LINK.alias}}} หรือเข้าสู่ระบบ<br />
      เพื่อเริ่มเรียนตามหลักสูตรในหน้าการเรียนรู้ของคุณได้ทันที {{${NV.LOGIN_LINK.alias}}}</p>
      
      <p>หวังว่าจะได้พบคุณในห้องเรียนเร็วๆนี้</p>
      
      <p>หากคุณมีข้อสงสัยหรือต้องการความช่วยเหลือ Member Services ของเราพร้อมให้บริการเสมอ</p>`,

      bodyText: `สวัสดีคุณ {{${NV.FULL_NAME.alias}}}

      พวกเราคิดถึงคุณ! 
      
      YourNextU มีหลักสูตรมากมายให้คุณได้เลือกลงทะเบียนตามรายวิชาที่คุณสนใจ {{${NV.DASHBOARD_COURSES_LINK.alias}}} หรือเข้าสู่ระบบ
      เพื่อเริ่มเรียนตามหลักสูตรในหน้าการเรียนรู้ของคุณได้ทันที {{${NV.LOGIN_LINK.alias}}}
      
      หวังว่าจะได้พบคุณในห้องเรียนเร็วๆนี้
      
      หากคุณมีข้อสงสัยหรือต้องการความช่วยเหลือ Member Services ของเราพร้อมให้บริการเสมอ`,
    },
  },

  [EmailNotificationSubCategoryKey.REMINDER_QUIZ_AFTER_SESSION]: {
    title: 'Quiz unlocked',

    availableVariables: [NV.FULL_NAME, NV.SESSION_NAME, NV.ASSESSMENT_LINK],

    en: {
      subject: `YourNextU: Quiz after {{${NV.SESSION_NAME.alias}}} session`,

      bodyHTML: `<p><strong>Hello {{${NV.FULL_NAME.alias}}}</strong>,</p>

      <p>Now that you've taken {{${NV.SESSION_NAME.alias}}}, it's a great time to take a quiz!<br />
      Click the link below and let's explore what you've learned.</p>
      
      <p>{{${NV.ASSESSMENT_LINK.alias}}}</p>`,

      bodyText: `Hello {{${NV.FULL_NAME.alias}}},

      Now that you've taken {{${NV.SESSION_NAME.alias}}}, it's a great time to take a quiz! 
      Click the link below and let's explore what you've learned.
      
      {{${NV.ASSESSMENT_LINK.alias}}}`,
    },

    th: {
      subject: `YourNextU: Quiz after {{${NV.SESSION_NAME.alias}}} session`,

      bodyHTML: `<p><strong>สวัสดีคุณ {{${NV.FULL_NAME.alias}}}</strong></p>

      <p>ขณะนี้คุณ {{${NV.FULL_NAME.alias}}} ได้เรียนจบหลักสูตร {{${NV.SESSION_NAME.alias}}} เรียบร้อยแล้ว<br />
      คลิกลิ้งก์ด้านล่างเพื่อทำแบบทดสอบ ประเมินความรู้ที่ได้เรียนมา</p>
      
      <p>{{${NV.ASSESSMENT_LINK.alias}}}</p>`,

      bodyText: `สวัสดีคุณ {{${NV.FULL_NAME.alias}}}

      ขณะนี้คุณ {{${NV.FULL_NAME.alias}}} ได้เรียนจบหลักสูตร {{${NV.SESSION_NAME.alias}}} เรียบร้อยแล้ว 
      คลิกลิ้งก์ด้านล่างเพื่อทำแบบทดสอบ ประเมินความรู้ที่ได้เรียนมา
      
      {{${NV.ASSESSMENT_LINK.alias}}}`,
    },
  },

  [EmailNotificationSubCategoryKey.BOOKING_INSTRUCTOR_CHANGED]: {
    title: 'Session Instructor Changed',

    availableVariables: [
      NV.FULL_NAME,
      NV.SESSION_NAME,
      NV.SESSION_START_DATETIME,
      NV.SESSION_END_DATETIME,
      NV.INSTRUCTOR_NAME,
      NV.SESSION_WAITING_ROOM_LINK,
    ],

    en: {
      subject: `YourNextU: Instructor changed {{${NV.SESSION_NAME.alias}}} {{${NV.SESSION_START_DATE.alias}}}`,

      bodyHTML: `<p><strong>Hello! {{${NV.FULL_NAME.alias}}}</strong></p>

      <p>We are apologize to inform you that we need to change schedule of one session that you booked as below.</p>
      
      <p>Session: {{${NV.SESSION_NAME.alias}}}<br />
      Start Date/Time: {{${NV.SESSION_START_DATETIME.alias}}}<br />
      End Date/Time: {{${NV.SESSION_END_DATETIME.alias}}}<br />
      <strong>Instructor: {{${NV.INSTRUCTOR_NAME.alias}}}</strong></p>
      
      <p>If you are not available or you want to cancel this booking from this link {{${NV.SESSION_WAITING_ROOM_LINK.alias}}}</p>
      
      <p>Sincerely apologize,</p>`,

      bodyText: `Hello! {{${NV.FULL_NAME.alias}}}

      We are apologize to inform you that we need to change schedule of one session that you booked as below.
      
      Session: {{${NV.SESSION_NAME.alias}}}
      Start Date/Time: {{${NV.SESSION_START_DATETIME.alias}}}
      End Date/Time: {{${NV.SESSION_END_DATETIME.alias}}}
      Instructor: {{${NV.INSTRUCTOR_NAME.alias}}}
      
      If you are not available or you want to cancel this booking from this link {{${NV.SESSION_WAITING_ROOM_LINK.alias}}}
      
      Sincerely apologize,`,
    },

    th: {
      subject: `YourNextU: แจ้งเปลี่ยนผู้สอน {{${NV.SESSION_NAME.alias}}} {{${NV.SESSION_START_DATE.alias}}}`,

      bodyHTML: `<p><strong>สวัสดีคุณ {{${NV.FULL_NAME.alias}}}</strong></p>

      <p>เราขอแจ้งให้ท่านทราบว่า คลาสที่ท่านได้ลงทะเบียนไว้มีการเปลี่ยนผู้สอน เป็นตามรายละเอียดดังนี้</p>
      
      <p>ชื่อคลาสเรียน: {{${NV.SESSION_NAME.alias}}}<br />
      วันและเวลาเริ่ม: {{${NV.SESSION_START_DATETIME.alias}}}<br />
      วันและเวลาจบ: {{${NV.SESSION_END_DATETIME.alias}}}<br />
      <strong>วิทยากร: {{${NV.INSTRUCTOR_NAME.alias}}}</strong></p>
      
      <p>หากท่านไม่สะดวกหรือต้องการยกเลิก สามารถกดจากจากลิงก์นี้ {{${NV.SESSION_WAITING_ROOM_LINK.alias}}}</p>
      
      <p>ทางเราขออภัยในความไม่สะดวก</p>`,

      bodyText: `สวัสดีคุณ {{${NV.FULL_NAME.alias}}}

      เราขอแจ้งให้ท่านทราบว่า คลาสที่ท่านได้ลงทะเบียนไว้มีการเปลี่ยนผู้สอน เป็นตามรายละเอียดดังนี้ 
      
      ชื่อคลาสเรียน: {{${NV.SESSION_NAME.alias}}}
      วันและเวลาเริ่ม: {{${NV.SESSION_START_DATETIME.alias}}}
      วันและเวลาจบ: {{${NV.SESSION_END_DATETIME.alias}}}
      วิทยากร: {{${NV.INSTRUCTOR_NAME.alias}}}
      
      หากท่านไม่สะดวกหรือต้องการยกเลิก สามารถกดจากจากลิงก์นี้ {{${NV.SESSION_WAITING_ROOM_LINK.alias}}}
      
      ทางเราขออภัยในความไม่สะดวก`,
    },
  },

  [EmailNotificationSubCategoryKey.ASSIGNMENT_TO_COURSE]: {
    title: 'Assign to the course',

    availableVariables: [
      NV.FULL_NAME,
      NV.EXPIRY_DATE,
      NV.COURSE_LIST,
      NV.DASHBOARD_COURSES_LINK,
    ],

    en: {
      subject: 'YourNextU: You have an assigned course',

      bodyHTML: `<p><strong>Hello! {{${NV.FULL_NAME.alias}}}</strong></p>
      <p>Reminder to complete the required courses below by {{${NV.EXPIRY_DATE.alias}}}</p>
      <p>{{${NV.COURSE_LIST.alias}}}</p>
      <p>You can start the course or enroll a session for each course from <a href="{{${NV.DASHBOARD_COURSES_LINK.alias}}}">{{${NV.DASHBOARD_COURSES_LINK.alias}}}</a></p>`,

      bodyText: `Hello! {{${NV.FULL_NAME.alias}}}
      <p>Reminder to complete the required courses below by {{${NV.EXPIRY_DATE.alias}}}</p>
      {{${NV.COURSE_LIST.alias}}}
      <p>You can start the course or enroll a session for each course from {{${NV.DASHBOARD_COURSES_LINK.alias}}}</p>`,
    },

    th: {
      subject: 'YourNextU: คุณมีหลักสูตรที่จำเป็นต้องเรียน',

      bodyHTML: `<p><strong>สวัสดีคุณ {{${NV.FULL_NAME.alias}}}</strong></p>
      <p>YourNextU ขอแจ้งให้ทราบว่าคุณมีหลักสูตรที่จำเป็นต้องเรียนให้จบก่อน {{${NV.EXPIRY_DATE.alias}}} ดังนี้:</p>
      <p>{{${NV.COURSE_LIST.alias}}}</p>
      <p>คุณสามารถเริ่มเรียน หรือลงทะเบียนเรียนในแต่ละหลักสูตรได้จากลิงก์นี้ <a href="{{${NV.DASHBOARD_COURSES_LINK.alias}}}">{{${NV.DASHBOARD_COURSES_LINK.alias}}}</a></p>`,

      bodyText: `สวัสดีคุณ {{${NV.FULL_NAME.alias}}}
      YourNextU ขอแจ้งให้ทราบว่าคุณมีหลักสูตรที่จำเป็นต้องเรียนให้จบก่อน {{${NV.EXPIRY_DATE.alias}}} ดังนี้:
      {{${NV.COURSE_LIST.alias}}}
      <p>คุณสามารถเริ่มเรียน หรือลงทะเบียนเรียนในแต่ละหลักสูตรได้จากลิงก์นี้ {{${NV.DASHBOARD_COURSES_LINK.alias}}}</p>`,
    },
  },

  [EmailNotificationSubCategoryKey.ASSIGNMENT_TO_LEARNING_TRACK]: {
    title: 'Assign to the learning track',

    availableVariables: [
      NV.FULL_NAME,
      NV.EXPIRY_DATE,
      NV.LEARNING_TRACK_LIST,
      NV.DASHBOARD_LEARNING_TRACKS_LINK,
    ],

    en: {
      subject: 'YourNextU: You have an assigned learning track',

      bodyHTML: `<p><strong>Hello! {{${NV.FULL_NAME.alias}}}</strong></p>
      <p>Reminder to complete the required learning track courses below by {{${NV.EXPIRY_DATE.alias}}}</p>
      <p>{{${NV.LEARNING_TRACK_LIST.alias}}}</p>
      <p>You can begin the course or enroll a session for each course from <a href="{{${NV.DASHBOARD_LEARNING_TRACKS_LINK.alias}}}">{{${NV.DASHBOARD_LEARNING_TRACKS_LINK.alias}}}</a></p>`,

      bodyText: `Hello! {{${NV.FULL_NAME.alias}}}
      <p>Reminder to complete the required learning track courses below by {{${NV.EXPIRY_DATE.alias}}}</p>
      {{${NV.LEARNING_TRACK_LIST.alias}}}
      <p>You can begin the course or enroll a session for each course from {{${NV.DASHBOARD_LEARNING_TRACKS_LINK.alias}}}</p>`,
    },

    th: {
      subject: 'YourNextU: คุณมี Learning track ที่ต้องเรียนให้จบ',

      bodyHTML: `<p><strong>สวัสดีคุณ {{${NV.FULL_NAME.alias}}}</strong></p>
      <p>YourNextU ขอแจ้งให้ทราบว่าคุณมี Learning Track ที่จำเป็นต้องเรียนให้จบก่อน {{${NV.EXPIRY_DATE.alias}}} ดังนี้:</p>
      <p>{{${NV.LEARNING_TRACK_LIST.alias}}}</p>
      <p>คุณสามารถเริ่มเรียน หรือลงทะเบียนเรียนแต่ละหลักสูตรได้จากลิงก์นี้ <a href="{{${NV.DASHBOARD_LEARNING_TRACKS_LINK.alias}}}">{{${NV.DASHBOARD_LEARNING_TRACKS_LINK.alias}}}</a></p>`,

      bodyText: `สวัสดีคุณ {{${NV.FULL_NAME.alias}}}
      YourNextU ขอแจ้งให้ทราบว่าคุณมี Learning Track ที่จำเป็นต้องเรียนให้จบก่อน {{${NV.EXPIRY_DATE.alias}}} ดังนี้:
      {{${NV.LEARNING_TRACK_LIST.alias}}}
      คุณสามารถเริ่มเรียน หรือลงทะเบียนเรียนแต่ละหลักสูตรได้จากลิงก์นี้ {{${NV.DASHBOARD_LEARNING_TRACKS_LINK.alias}}}`,
    },
  },

  [EmailNotificationSubCategoryKey.ASSIGNMENT_TO_SESSION_F2F]: {
    title: 'Assign to session (F2F)',

    availableVariables: [
      NV.FULL_NAME,
      NV.SESSION_NAME,
      NV.SESSION_START_DATETIME,
      NV.SESSION_END_DATETIME,
      NV.INSTRUCTOR_NAME,
      NV.LOCATION_NAME,
    ],

    en: {
      subject: `YourNextU: You have an assigned session {{${NV.SESSION_NAME.alias}}}`,

      bodyHTML: `<p><strong>Hello! {{${NV.FULL_NAME.alias}}}</strong></p>

      <p>We'd like to inform that you have a required session to join details in following. We're very much looking forward to seeing you there.</p>
      
      <p>Session: {{${NV.SESSION_NAME.alias}}}<br />
      Start Date/Time: {{${NV.SESSION_START_DATETIME.alias}}}<br />
      End Date/Time: {{${NV.SESSION_END_DATETIME.alias}}}<br />
      Instructor: {{${NV.INSTRUCTOR_NAME.alias}}}<br />
      Venue: {{${NV.LOCATION_NAME.alias}}}</p>
      
      <p>Please be informed that pre-requisite coursework is required in some courses. In the event that we detect that you have not passed the previous course, we apologize to cancel your registration for this course and recommend you choose a new schedule at "My Dashboard" in YourNextU platform.</p>
      
      <p><strong>Important Information</strong><br />
      1. Identification card, government official card, employee card (with photo and full name) or government-issued card is required to verify identity at the registration point.<br />
      2. Vaccination Certificate or Card is required.<br />
      3. For those who have not yet received a full vaccination, you must provide your COVID-19 test result (RT-PCR or Antigen Test Kit) issued within 7 days.<br />
      4. Please be on time. Participants that enter late will not be allowed to join the session.</p>`,

      bodyText: `Hello! {{${NV.FULL_NAME.alias}}}

      We'd like to inform that you have a required session to join details in following. We're very much looking forward to seeing you there.
      
      Session: {{${NV.SESSION_NAME.alias}}}
      Start Date/Time: {{${NV.SESSION_START_DATETIME.alias}}}
      End Date/Time: {{${NV.SESSION_END_DATETIME.alias}}}
      Instructor: {{${NV.INSTRUCTOR_NAME.alias}}}
      Venue: {{${NV.LOCATION_NAME.alias}}}
      
      Please be informed that pre-requisite coursework is required in some courses. In the event that we detect that you have not passed the previous course, we apologize to cancel your registration for this course and recommend you choose a new schedule at "My Dashboard" in YourNextU platform.
      
      Important Information
      1. Identification card, government official card, employee card (with photo and full name) or government-issued card is required to verify identity at the registration point.
      2. Vaccination Certificate or Card is required.
      3. For those who have not yet received a full vaccination, you must provide your COVID-19 test result (RT-PCR or Antigen Test Kit) issued within 7 days.
      4. Please be on time. Participants that enter late will not be allowed to join the session.`,
    },

    th: {
      subject: `YourNextU: คุณมีคลาสที่จำเป็นต้องเข้าเรียน {{${NV.SESSION_NAME.alias}}}`,

      bodyHTML: `<p><strong>สวัสดีคุณ {{${NV.SESSION_NAME.alias}}}</strong></p>

      <p>YourNextU ขอแจ้งให้ทราบว่าคุณมีหลักสูตรที่จำเป็นต้องเข้าเรียน ตามรายละเอียดดังนี้:</p>
      
      <p>ชื่อคลาสเรียน: {{${NV.SESSION_NAME.alias}}}<br />
      วันและเวลาเริ่ม: {{${NV.SESSION_START_DATE.alias}}}<br />
      วันและเวลาจบ: {{${NV.SESSION_NAME.alias}}}<br />
      วิทยากร: {{${NV.INSTRUCTOR_NAME.alias}}}<br />
      สถานที่: {{${NV.LOCATION_NAME.alias}}}</p>
      
      <p>ทั้งนี้เนื่องจากบางหลักสูตรของเราเป็นกลุ่มของหลักสูตรที่เนื้อหามีความต่อเนื่องกัน ดังนั้นหากมีการตรวจพบว่าท่านไม่ได้ผ่านการเรียนหลักสูตรก่อนหน้ามาก่อน ทางเราขออภัยที่ต้องยกเลิกการลงทะเบียนเรียนหลักสูตรนี้ของท่าน และขอแนะนำให้ท่านสมาชิกเข้าไปเลือกเวลาเรียนใหม่ ได้ที่ ”แดชบอร์ดของฉัน”</p>
      
      <p><strong>กรุณาเตรียม</strong><br />
      1. บัตรประชาชน บัตรข้าราชการ บัตรพนักงาน (ที่มีรูปถ่ายและชื่อ-นามสกุล) หรือบัตรที่ออกโดยภาครัฐเพื่อยืนยันตัวตน ณ จุดลงทะเบียน<br />
      2. ผลรับรองการฉีดวัคซีนผ่าน Digital Health Pass หรือ Application หมอพร้อม หรือใช้เอกสารใบรับรองผลการฉีดวัคซีน (อย่างใดอย่างหนึ่ง)<br />
      3. สำหรับท่านที่ยังได้รับวัคซีนไม่ครบ สามารถแสดงใบรับรองประวัติผลการตรวจหาเชื้อโควิด-19 แบบ PCR หรือ ATK ที่เป็นลบภายในระยะเวลาไม่เกิน 7 วัน (ทั้งแบบเอกสารและภาพถ่ายที่เห็นวันที่ตรวจและผลเป็นลบชัดเจน)<br />
      4. กรุณาเผื่อเวลาในการเดินทางเนื่องจากคลาสเริ่มตรงเวลา หากมาสายเจ้าหน้าที่ขอสงวนสิทธิ์ในการเข้าห้องเรียน</p>`,

      bodyText: `สวัสดีคุณ {{${NV.SESSION_NAME.alias}}}

      YourNextU ขอแจ้งให้ทราบว่าคุณมีหลักสูตรที่จำเป็นต้องเข้าเรียน ตามรายละเอียดดังนี้:
      
      ชื่อคลาสเรียน: {{${NV.SESSION_NAME.alias}}}
      วันและเวลาเริ่ม: {{${NV.SESSION_START_DATE.alias}}}
      วันและเวลาจบ: {{${NV.SESSION_NAME.alias}}}
      วิทยากร: {{${NV.INSTRUCTOR_NAME.alias}}}
      สถานที่: {{${NV.LOCATION_NAME.alias}}}
      
      ทั้งนี้เนื่องจากบางหลักสูตรของเราเป็นกลุ่มของหลักสูตรที่เนื้อหามีความต่อเนื่องกัน ดังนั้นหากมีการตรวจพบว่าท่านไม่ได้ผ่านการเรียนหลักสูตรก่อนหน้ามาก่อน ทางเราขออภัยที่ต้องยกเลิกการลงทะเบียนเรียนหลักสูตรนี้ของท่าน และขอแนะนำให้ท่านสมาชิกเข้าไปเลือกเวลาเรียนใหม่ ได้ที่ ”แดชบอร์ดของฉัน”
      
      กรุณาเตรียม
      1. บัตรประชาชน บัตรข้าราชการ บัตรพนักงาน (ที่มีรูปถ่ายและชื่อ-นามสกุล) หรือบัตรที่ออกโดยภาครัฐเพื่อยืนยันตัวตน ณ จุดลงทะเบียน
      2. ผลรับรองการฉีดวัคซีนผ่าน Digital Health Pass หรือ Application หมอพร้อม หรือใช้เอกสารใบรับรองผลการฉีดวัคซีน (อย่างใดอย่างหนึ่ง)
      3. สำหรับท่านที่ยังได้รับวัคซีนไม่ครบ สามารถแสดงใบรับรองประวัติผลการตรวจหาเชื้อโควิด-19 แบบ PCR หรือ ATK ที่เป็นลบภายในระยะเวลาไม่เกิน 7 วัน (ทั้งแบบเอกสารและภาพถ่ายที่เห็นวันที่ตรวจและผลเป็นลบชัดเจน)
      4. กรุณาเผื่อเวลาในการเดินทางเนื่องจากคลาสเริ่มตรงเวลา หากมาสายเจ้าหน้าที่ขอสงวนสิทธิ์ในการเข้าห้องเรียน`,
    },
  },

  [EmailNotificationSubCategoryKey.ASSIGNMENT_TO_SESSION_VIRTUAL]: {
    title: 'Assign to session (Virtual)',

    availableVariables: [
      NV.FULL_NAME,
      NV.SESSION_NAME,
      NV.SESSION_START_DATETIME,
      NV.SESSION_END_DATETIME,
      NV.INSTRUCTOR_NAME,
      NV.WEBINAR_TOOL,
      NV.SESSION_WAITING_ROOM_LINK,
      NV.LOCATION_NAME,
      NV.COURSE_DETAIL_LINK,
    ],

    en: {
      subject: `YourNextU: You have an assigned session {{${NV.SESSION_NAME.alias}}}`,

      bodyHTML: `<p><strong>Hello! {{${NV.FULL_NAME.alias}}}</strong></p>

      <p>We'd like to inform that you have a required session to join details in following.</p>
      
      <p>Session: {{${NV.SESSION_NAME.alias}}}<br />
      Start Date/Time: {{${NV.SESSION_START_DATETIME.alias}}}<br />
      End Date/Time: {{${NV.SESSION_END_DATETIME.alias}}}<br />
      Instructor: {{${NV.INSTRUCTOR_NAME.alias}}}<br />
      Webinar tool: {{${NV.WEBINAR_TOOL.alias}}}<br />
      Link: {{${NV.SESSION_WAITING_ROOM_LINK.alias}}}</p>
      
      <p><strong>Important note</strong><br />
      Please join the class 20 minutes before the session starts, and log-in before joining the session. Participants that enter late will not be allowed to join the session.</p>
      
      <p>Click on the link below to go to the course page. Don't forget to download the course materials for the session.<br />
      {{${NV.COURSE_DETAIL_LINK.alias}}}</p>`,

      bodyText: `Hello! {{${NV.FULL_NAME.alias}}}

      We'd like to inform that you have a required session to join details in following.
      
      Session: {{${NV.SESSION_NAME.alias}}}
      Start Date/Time: {{${NV.SESSION_START_DATETIME.alias}}}
      End Date/Time: {{${NV.SESSION_END_DATETIME.alias}}}
      Instructor: {{${NV.INSTRUCTOR_NAME.alias}}}
      Webinar tool: {{${NV.WEBINAR_TOOL.alias}}}
      Link: {{${NV.SESSION_WAITING_ROOM_LINK.alias}}}
      
      Important note
      Please join the class 20 minutes before the session starts, and log-in before joining the session. Participants that enter late will not be allowed to join the session.
      
      Click on the link below to go to the course page. Don't forget to download the course materials for the session.
      {{${NV.COURSE_DETAIL_LINK.alias}}}`,
    },

    th: {
      subject: `YourNextU: คุณมีคลาสที่จำเป็นต้องเข้าเรียน {{${NV.SESSION_NAME.alias}}}`,

      bodyHTML: `<p><strong>สวัสดีค่ะ คุณ {{${NV.FULL_NAME.alias}}}</strong></p>

      <p>YourNextU ขอแจ้งให้ทราบว่าคุณมีหลักสูตรที่จำเป็นต้องเข้าเรียน ตามรายละเอียดดังนี้:</p>
      
      <p>ชื่อคลาสเรียน: {{${NV.SESSION_NAME.alias}}}<br />
      วันและเวลาเริ่ม: {{${NV.SESSION_START_DATETIME.alias}}}<br />
      วันและเวลาจบ: {{${NV.SESSION_END_DATETIME.alias}}}<br />
      วิทยากร: {{${NV.INSTRUCTOR_NAME.alias}}}<br />
      วิธีการเข้าเรียน: {{${NV.WEBINAR_TOOL.alias}}}<br />
      ลิงก์เข้าเรียน: {{${NV.SESSION_WAITING_ROOM_LINK.alias}}}</p>
      
      <p>หมายเหตุ: กรุณาเข้าร่วมคลาส 20 นาทีก่อนเวลาเริ่มเรียน หากขอเข้าห้องเรียนสายเกินกว่าเวลาที่กำหนด เจ้าหน้าขอสงวนสิทธิ์ในการเข้าเรียน</p>
      
      <p>กดที่ลิงก์ด้านล่างเพื่อไปที่หลักสูตร และอย่าลืมเข้าไปดาวน์โหลดเอกสารการประกอบการเรียนที่หัวข้อ Material<br />
      {{${NV.COURSE_DETAIL_LINK.alias}}}</p>`,

      bodyText: `สวัสดีค่ะ คุณ {{${NV.FULL_NAME.alias}}}

      YourNextU ขอแจ้งให้ทราบว่าคุณมีหลักสูตรที่จำเป็นต้องเข้าเรียน ตามรายละเอียดดังนี้:
      
      ชื่อคลาสเรียน: {{${NV.SESSION_NAME.alias}}}
      วันและเวลาเริ่ม: {{${NV.SESSION_START_DATETIME.alias}}}
      วันและเวลาจบ: {{${NV.SESSION_END_DATETIME.alias}}}
      วิทยากร: {{${NV.INSTRUCTOR_NAME.alias}}}
      วิธีการเข้าเรียน: {{${NV.WEBINAR_TOOL.alias}}}
      ลิงก์เข้าเรียน: {{${NV.SESSION_WAITING_ROOM_LINK.alias}}}
      
      หมายเหตุ: กรุณาเข้าร่วมคลาส 20 นาทีก่อนเวลาเริ่มเรียน หากขอเข้าห้องเรียนสายเกินกว่าเวลาที่กำหนด เจ้าหน้าขอสงวนสิทธิ์ในการเข้าเรียน
      
      กดที่ลิงก์ด้านล่างเพื่อไปที่หลักสูตร และอย่าลืมเข้าไปดาวน์โหลดเอกสารการประกอบการเรียนที่หัวข้อ Material 
      {{${NV.COURSE_DETAIL_LINK.alias}}}`,
    },
  },
};

export const EmailFormatSeedData = {
  en: {
    formatName: 'YNU Header-Footer (EN)',
    teamName: 'YourNextU Team',

    footerHTML: `<p><strong>Should you have any questions or requests, please feel free to contact YourNextU Member Services at</strong><br />
    <strong>Email</strong>: helpme@yournextu.com  (Mon– Fri 8.00 - 18.00 excluding public holidays)<br />
    <strong>LINE Official</strong>: @yournextu (Mon-Fri 8.00 - 20.00, Sat-Sun 8.00 - 17.00)<br />
    <strong>Tel</strong>: 061-420-5959  (Mon– Fri 8.00 - 18.00 excluding public holidays)</p>`,

    footerText: `Should you have any questions or requests, please feel free to contact YourNextU Member Services at
    Email: helpme@yournextu.com  (Mon– Fri 8.00 - 18.00 excluding public holidays)
    LINE Official: @yournextu (Mon-Fri 8.00 - 20.00, Sat-Sun 8.00 - 17.00) 
    Tel: 061-420-5959  (Mon– Fri 8.00 - 18.00 excluding public holidays)`,

    isDefault: true,
  },
  th: {
    formatName: 'YNU Header-Footer (TH)',
    teamName: 'YourNextU Team',

    footerHTML: `<p><strong>สอบถามข้อมูลเพิ่มเติมได้ที่</strong><br />
    <strong>โทร</strong>: (+66) 61 420 5959 (จันทร์-ศุกร์ 8.00น. - 18:00น. ยกเว้นวันหยุดตามธนาคารแห่งประเทศไทย)<br />
    <strong>Official Line</strong>: @yournextu (จันทร์-ศุกร์ 8.00น. - 20.00น., เสาร์-อาทิตย์ 8.00น. - 17.00น.)<br />
    <strong>อีเมล</strong>: helpme@yournextu.com (จันทร์-ศุกร์ 8.00น. - 18:00น. ยกเว้นวันหยุดตามธนาคารแห่งประเทศไทย)</p>`,

    footerText: `สอบถามข้อมูลเพิ่มเติมได้ที่
    โทร: (+66) 61 420 5959 (จันทร์-ศุกร์ 8.00น. - 18:00น. ยกเว้นวันหยุดตามธนาคารแห่งประเทศไทย)
    Official Line: @yournextu (จันทร์-ศุกร์ 8.00น. - 20.00น., เสาร์-อาทิตย์ 8.00น. - 17.00น.)
    อีเมล: helpme@yournextu.com (จันทร์-ศุกร์ 8.00น. - 18:00น. ยกเว้นวันหยุดตามธนาคารแห่งประเทศไทย)`,

    isDefault: false,
  },
};
