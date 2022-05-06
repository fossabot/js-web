export const UserActivityLogsTableName =
  process.env.DYNAMODB_MAIN_TABLE_NAME || '';

export const userLogCategory = {
  GENERAL: 'GENERAL',
  COURSE: 'COURSE',
  COURSE_SESSION: 'COURSE SESSION',
  PROFILE: 'PROFILE',
  LEARNING_TRACK: 'LEARNING_TRACK',
};

export const userLogSubCategory = {
  ARCHIVE_COURSE: 'ARCHIVE COURSE',
  UNARCHIVE_COURSE: 'UNARCHIVE COURSE',
  ENROLL: 'ENROLL',
  VALIDATE_SUBSCRIPTION_PLAN: 'VALIDATE SUBSCRIPTION PLAN',
  PROGRESS_COURSE: 'PROGRESS COURSE',
  BOOK: 'BOOK',
  CANCEL_BOOKING: 'CANCEL BOOKING',
  VALIDATE_BOOKING: 'VALIDATE BOOKING',
  UPDATE_PROFILE_INFO: 'UPDATE PROFILE INFO',
  ASSESSMENT: 'ASSESSMENT',
  ARCHIVE_LEARNING_TRACK: 'ARCHIVE LEARNING TRACK',
  UNARCHIVE_LEARNING_TRACK: 'UNARCHIVE LEARNING TRACK',
};