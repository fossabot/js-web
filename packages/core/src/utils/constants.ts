export const EMAIL_PATTERN = '^[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+[.][a-zA-Z]{2,}$';

export const TH_PHONE_REGEX = '^((08|09|06)([0-9]{8})|(0[23457])([0-9]{7}))$';

export const S3_FILE_UPLOAD_LIMIT = 5242880; // 5mb

export const DEFAULT_TIMEZONE = 'Asia/Bangkok';

export const BANGKOK_TIMEZONE = 'Asia/Bangkok';

export const UTC_TIMEZONE = 'UTC';

export const DEFAULT_DATE_FORMAT = 'd MMM yyyy HH:mm:ss';

export const NOTIFICATION_DATE_FORMAT = 'dd MMM yyyy HH:mm';

export const DELIMITER_PATTERN = '[,]|(\r\n|\r|\n)';

export const DEFAULT_PAGE_LIMIT = 1000;

export const SYSTEM_ROLES = {
  ROOT: 'root',
  ADMIN: 'Admin',
  CORPORATE_ADMIN: 'Corporate Admin',
  MEMBER: 'Member',
  INSTRUCTOR: 'Instructor',
  MODERATOR: 'Moderator',
};
