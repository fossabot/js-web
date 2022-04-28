export type NotificationVariableKeys =
  | 'FULL_NAME'
  | 'EMAIL'
  | 'MEMBERSHIP_EXPIRY_DATE'
  | 'MEMBERSHIP_REMAINING_DAYS'
  | 'PACKAGE_NAME'
  | 'PACKAGE_PAGE_LINK'
  | 'EXPIRY_DATE'
  | 'ACCOUNT_ACTIVATION_LINK'
  | 'LOGIN_LINK'
  | 'ASSESSMENT_NAME'
  | 'ASSESSMENT_LINK'
  | 'RESET_PASSWORD_LINK'
  | 'DASHBOARD_COURSES_LINK'
  | 'DASHBOARD_LEARNING_TRACKS_LINK'
  | 'SESSION_NAME'
  | 'SESSION_START_DATETIME'
  | 'SESSION_START_DATE'
  | 'SESSION_END_DATETIME'
  | 'SESSION_END_DATE'
  | 'SESSION_REGISTERED_DATETIME'
  | 'SESSION_CANCELLED_DATETIME'
  | 'SESSION_WAITING_ROOM_LINK'
  | 'OLD_SESSION_START_DATETIME'
  | 'INSTRUCTOR_NAME'
  | 'LOCATION_NAME'
  | 'COURSE_NAME'
  | 'COURSE_DETAIL_LINK'
  | 'COURSE_LIST'
  | 'LEARNING_TRACK_NAME'
  | 'LEARNING_TRACK_LIST'
  | 'OUTLINE_SCHEDULE_LINK'
  | 'CERTIFICATE_NAME'
  | 'CERTIFICATE_LINK'
  | 'WEBINAR_TOOL'
  | 'SYSTEM_ANNOUNCEMENT_TITLE'
  | 'SYSTEM_ANNOUNCEMENT_MESSAGE_START_DATETIME'
  | 'SYSTEM_ANNOUNCEMENT_MESSAGE_END_DATETIME'
  | 'SYSTEM_ANNOUNCEMENT_MESSAGE';

type NotificationVariableDictType = {
  [key in NotificationVariableKeys]: {
    name: string;
    alias: string;
    description: string;
    iterable: boolean;
  };
};

/**
 * All of the available variables for notification system.
 */
export const NotificationVariableDict: NotificationVariableDictType = {
  FULL_NAME: {
    name: 'Learner full name',
    alias: 'fullName',
    description: "User's full name",
    iterable: false,
  },

  EMAIL: {
    name: 'Learner Email',
    alias: 'email',
    description: "User's email",
    iterable: false,
  },

  MEMBERSHIP_EXPIRY_DATE: {
    name: 'Membership expiry date',
    alias: 'membershipExpiryDate',
    description: 'Membership Expiry Date.',
    iterable: false,
  },

  MEMBERSHIP_REMAINING_DAYS: {
    name: 'Membership Remaining days',
    alias: 'membershipRemainingDays',
    description: 'Membership remaining days.',
    iterable: false,
  },

  PACKAGE_NAME: {
    name: 'Package name',
    alias: 'packageName',
    description: 'Package name.',
    iterable: false,
  },

  PACKAGE_PAGE_LINK: {
    name: 'Package link',
    alias: 'packagePageLink',
    description: 'Link to package page.',
    iterable: false,
  },

  EXPIRY_DATE: {
    name: 'Expiry date',
    alias: 'expiryDate',
    description: 'General Purpose Expiry Date.',
    iterable: false,
  },

  ACCOUNT_ACTIVATION_LINK: {
    name: 'Account activation link',
    alias: 'accountActivationLink',
    description: 'Account activation link.',
    iterable: false,
  },

  LOGIN_LINK: {
    name: 'Login link',
    alias: 'loginLink',
    description: 'Link to login page.',
    iterable: false,
  },

  ASSESSMENT_NAME: {
    name: 'Assessment name',
    alias: 'assessmentName',
    description: 'Assessment name.',
    iterable: false,
  },

  ASSESSMENT_LINK: {
    name: 'Assessment link',
    alias: 'assessmentLink',
    description: 'Link to assessment page.',
    iterable: false,
  },

  RESET_PASSWORD_LINK: {
    name: 'Reset password link',
    alias: 'resetPasswordLink',
    description: 'Reset password link.',
    iterable: false,
  },

  DASHBOARD_COURSES_LINK: {
    name: 'Dashboard courses link',
    alias: 'dashboardCoursesLink',
    description: 'Dashboard > Courses list page.',
    iterable: false,
  },

  DASHBOARD_LEARNING_TRACKS_LINK: {
    name: 'Dashboard learning track link',
    alias: 'dashboardLearningTracksLink',
    description: 'Dashboard > Learning track list page.',
    iterable: false,
  },

  SESSION_NAME: {
    name: 'Session name',
    alias: 'sessionName',
    description: 'Course Session Name.',
    iterable: false,
  },

  SESSION_START_DATETIME: {
    name: 'Session start date/time',
    alias: 'sessionStartDateTime',
    description: 'Session Start Date Time.',
    iterable: false,
  },

  SESSION_START_DATE: {
    name: 'Session start date',
    alias: 'sessionStartDate',
    description: 'Session Start Date.',
    iterable: false,
  },

  SESSION_END_DATETIME: {
    name: 'Session end date/time',
    alias: 'sessionEndDateTime',
    description: 'Session End Date Time.',
    iterable: false,
  },

  SESSION_END_DATE: {
    name: 'Session end date',
    alias: 'sessionEndDate',
    description: 'Session End Date.',
    iterable: false,
  },

  SESSION_REGISTERED_DATETIME: {
    name: 'Session registered date/time',
    alias: 'sessionRegisteredDateTime',
    description: 'Session registered (booked) date time.',
    iterable: false,
  },

  SESSION_CANCELLED_DATETIME: {
    name: 'Session cancelled date/time',
    alias: 'sessionCancelledDateTime',
    description: 'Session cancelled date time.',
    iterable: false,
  },

  SESSION_WAITING_ROOM_LINK: {
    name: 'Session waiting room link',
    alias: 'sessionWaitingRoomLink',
    description: 'Link to a waiting room of specifc session.',
    iterable: false,
  },

  OLD_SESSION_START_DATETIME: {
    name: 'Old session start date/time',
    alias: 'oldSessionStartDateTime',
    description:
      'Old session date time. Use in case that session schedule changed.',
    iterable: false,
  },

  INSTRUCTOR_NAME: {
    name: 'Instructor name',
    alias: 'instructorName',
    description: 'Instructor name.',
    iterable: false,
  },

  LOCATION_NAME: {
    name: 'Location name',
    alias: 'locationName',
    description: 'Location/Venu name for F2F session.',
    iterable: false,
  },

  COURSE_NAME: {
    name: 'Course name',
    alias: 'courseName',
    description: 'Course name.',
    iterable: false,
  },

  COURSE_DETAIL_LINK: {
    name: 'Course detail link',
    alias: 'courseDetailLink',
    description: 'Link to course detail page.',
    iterable: false,
  },

  COURSE_LIST: {
    name: 'Course list',
    alias: 'courseList',
    description: 'List of courses. Use for iteration in templates.',
    iterable: true,
  },

  LEARNING_TRACK_NAME: {
    name: 'Learning track name',
    alias: 'learningTrackName',
    description: 'Learning track name.',
    iterable: false,
  },

  LEARNING_TRACK_LIST: {
    name: 'Learning track list',
    alias: 'learningTrackList',
    description: 'List of learning tracks. Use for iteration in templates.',
    iterable: true,
  },

  OUTLINE_SCHEDULE_LINK: {
    name: 'Outline schedule link',
    alias: 'outlineScheduleLink',
    description: 'Course outline calendar URL.',
    iterable: false,
  },

  CERTIFICATE_NAME: {
    name: 'Certificate name',
    alias: 'certificateName',
    description: 'Certificate name.',
    iterable: false,
  },

  CERTIFICATE_LINK: {
    name: 'Certificate link',
    alias: 'certificateLink',
    description: 'Link to certificate.',
    iterable: false,
  },

  WEBINAR_TOOL: {
    name: 'Webinar tool',
    alias: 'webinarTool',
    description: 'Webinar tool.',
    iterable: false,
  },
  SYSTEM_ANNOUNCEMENT_TITLE: {
    name: 'System announcement title',
    alias: 'systemAnnouncementTitle',
    description: 'System announcement title.',
    iterable: false,
  },
  SYSTEM_ANNOUNCEMENT_MESSAGE_START_DATETIME: {
    name: 'System announcement message start date/time',
    alias: 'systemAnnouncementMessageStartDateTime',
    description: 'System announcement message start date time.',
    iterable: false,
  },
  SYSTEM_ANNOUNCEMENT_MESSAGE_END_DATETIME: {
    name: 'System announcement message end date/time',
    alias: 'systemAnnouncementMessageEndDateTime',
    description: 'System announcement message end date time.',
    iterable: false,
  },
  SYSTEM_ANNOUNCEMENT_MESSAGE: {
    name: 'System announcement message',
    alias: 'systemAnnouncementMessage',
    description: 'System announcement message.',
    iterable: false,
  },
};
