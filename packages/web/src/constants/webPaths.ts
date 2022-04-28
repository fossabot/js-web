const WEB_PATHS = {
  INDEX: '/',
  LOGIN: '/login',
  SIGN_UP: '/sign-up',
  FORGOT_PASSWORD: '/forgot-password',
  DASHBOARD: '/dashboard',
  DASHBOARD_COURSES: '/dashboard/courses',
  DASHBOARD_LEARNING_TRACKS: '/dashboard/learning-tracks',
  DASHBOARD_BOOKINGS: '/dashboard/bookings',
  DASHBOARD_BOOKINGS_WAITING_ROOM: '/dashboard/bookings/:id',
  DASHBOARD_CERTIFICATE: '/dashboard/certificate',
  HELP_CENTER: `${process.env.NEXT_PUBLIC_CORPORATE_WEB_BASE_URL}/help-center`,
  MY_SUBSCRIPTIONS: '/subscriptions',
  PLANS: '/plans',
  PLAN_DETAIL: '/plans/:planId',
  PLAN_PAYMENT: '/payment/plan/:planId',
  ADMIN: '/admin',
  ADMIN_LOGIN_SETTING: '/admin/setting/login',
  ADMIN_PASSWORD_SETTING: '/admin/setting/password',
  ADMIN_USER_MANAGEMENT: '/admin/user-management',
  ADMIN_USER_MANAGEMENT_INVITATION: '/admin/user-management/invitation',
  ADMIN_USER_UPLOAD_HISTORY: '/admin/user-management/upload-history',
  ADMIN_USER_UPLOAD: '/admin/user-management/upload',
  ADMIN_INVITE_USER: '/admin/user-management/invite',
  ADMIN_USER_PURCHASE_HISTORY: '/admin/user-management/:id/purchase-history',
  ADMIN_USER_PROFILE: '/admin/user-management/:id',
  ADMIN_ROLE_POLICY_MANAGEMENT: '/admin/user-management/manage-role-policy',
  ADMIN_TAGS: '/admin/tags',
  ADMIN_TOPICS: '/admin/topics',
  ADMIN_LEARNING_WAYS: '/admin/learning-ways',
  ADMIN_CATALOG_MENU: '/admin/catalog-menu',
  ORGANIZATION_MANAGEMENT: '/organization-management',
  ORGANIZATION_DETAIL: '/organization-management/:id',
  ORGANIZATION_LIST_USER: '/organization-management/:id/users',
  ORGANIZATION_USER_UPLOAD_HISTORY:
    '/organization-management/:id/users/upload-history',
  ORGANIZATION_USER_UPLOAD: '/organization-management/:id/users/upload',
  ORGANIZATION_ADD: '/organization-management/add',
  EXTERNAL_PROVIDER_PLANS_PAGE: '/organization-management/:id/plans',
  LINKED_PLANS_PAGE: '/organization-management/linked-plans',
  PAYMENT_DASHBOARD_PAGE: '/payment/dashboard',
  ADMIN_GROUP_MANAGEMENT: '/admin/group-management',
  ADMIN_ADD_USER: '/admin/user-management/add',
  MY_PACKAGES: '/account/my-packages',
  EDIT_PROFILE: '/account/profile',
  MANAGE_ADDRESS: '/account/manage-address',
  MANAGE_ADDRESS_ID: '/account/manage-address/:id',
  MANAGE_ADDRESS_CREATE: '/account/manage-address/create/',
  CHANGE_PASSWORD: '/account/change-password',
  PURCHASE_HISTORY: '/account/purchase-history',
  ACCOUNT_SETTING: '/account/setting',
  COURSE: '/course',
  COURSE_CREATE: '/course/create',
  COURSE_OUTLINE_BUNDLE: '/course/outline-bundle',
  ADMIN_COURSE_DETAIL: '/course/:id',
  COURSE_DETAIL: '/course-detail/:id',
  COURSE_RULE: '/course-rule',
  COURSE_RULE_CREATE: '/course-rule/create',
  COURSE_RULE_DETAIL: '/course-rule/:id',
  COURSE_SESSION_BOOKING: '/booking/session/:bookingId',
  COURSE_OUTLINE_SESSIONS: '/course-outline/:id/sessions',
  COURSE_VIDEO_PLAYER: '/course/:id/videos/:videoId',
  COURSE_ATTENDANCE: '/course-attendance',
  COURSE_MANAGE_ACCESS: '/course/manage-access',
  COURSE_MANAGE_ACCESS_BULK_UPLOAD: '/course/manage-access/bulk-upload',
  COURSE_MANAGE_ACCESS_BULK_UPLOAD_HISTORY:
    '/course/manage-access/upload-history',
  COURSE_REQUIRED_ASSIGNED: '/course/required-assigned',
  COURSE_REQUIRED_ASSIGNED_BULK_UPLOAD: '/course/required-assigned/bulk-upload',
  COURSE_REQUIRED_ASSIGNED_BULK_UPLOAD_HISTORY:
    '/course/required-assigned/upload-history',
  ADMIN_PROMO_BANNER: '/admin/promo-banner',

  COURSE_DISCOVERY_MANAGEMENT: '/admin/course-discovery',

  MATERIALS: '/materials',
  MATERIALS_CREATE: '/materials/create',
  MATERIALS_DETAIL: '/materials/:id',
  PLAN_MANAGEMENT: '/admin/plan-management',
  PLAN_MANAGEMENT_DETAIL: '/admin/plan-management/:id',
  PLAN_COURSE_BUNDLE: '/admin/plan-management/course-bundle',
  VIDEO_MANAGEMENT: '/admin/video-management',
  VIDEO_MANAGEMENT_CREATE: '/admin/video-management/create',
  VIDEO_MANAGEMENT_DETAIL: '/admin/video-management/:id',
  CERTIFICATE_MANAGEMENT: '/admin/certificate-management',
  CERTIFICATE_MANAGEMENT_CREATE: '/admin/certificate-management/create',
  CERTIFICATE_MANAGEMENT_ID: '/admin/certificate-management/:id',
  CERTIFICATE_MANAGEMENT_PREVIEW: '/admin/certificate-management/:id/preview',
  CERTIFICATE_UNLOCK_RULE: '/admin/certificate-unlock-rule',
  CERTIFICATE_UNLOCK_RULE_CREATE: '/admin/certificate-unlock-rule/create',
  CERTIFICATE_UNLOCK_RULE_DETAIL: '/admin/certificate-unlock-rule/:id',

  ADMIN_LEARNING_TRACK: '/admin/learning-track',
  ADMIN_LEARNING_TRACK_DETAIL: '/admin/learning-track/:id',
  LEARNING_TRACK_CREATE: '/admin/learning-track/create',

  LEARNING_TRACK_MANAGE_ACCESS: '/admin/learning-track/manage-access',
  LEARNING_TRACK_MANAGE_ACCESS_BULK_UPLOAD:
    '/admin/learning-track/manage-access/bulk-upload',
  LEARNING_TRACK_MANAGE_ACCESS_BULK_UPLOAD_HISTORY:
    '/admin/learning-track/manage-access/upload-history',

  LEARNING_TRACK_ASSIGNED: '/admin/learning-track/assigned',
  LEARNING_TRACK_ASSIGNED_BULK_UPLOAD:
    '/admin/learning-track/assigned/bulk-upload',
  LEARNING_TRACK_ASSIGNED_BULK_UPLOAD_HISTORY:
    '/admin/learning-track/assigned/upload-history',

  SESSION_MANAGEMENT: '/admin/sessions',
  SESSION_MANAGEMENT_CREATE: '/admin/sessions/create',
  SESSION_MANAGEMENT_EDIT: '/admin/sessions/:id/edit',
  SESSION_MANAGEMENT_BULK_UPLOAD: '/admin/sessions/bulk-upload',
  SESSION_MANAGEMENT_BULK_UPLOAD_HISTORY: '/admin/sessions/upload-history',

  CATALOG: '/catalog',
  CATALOG_TOPICS: '/catalog/topics',
  CATALOG_LEARNING_WAYS: '/catalog/learning-ways',
  CATALOG_COURSES: '/catalog/courses',

  LEARNING_TRACK: '/learning-track',
  LEARNING_TRACK_DETAIL: '/learning-track-detail/:id',
  EVENT_CALENDAR: '/events',

  SCORM_PLAYER: '/scorm/:id',

  VIDEO_PLAYER: '/course/:courseId/videos/:videoId',

  ORDER_STATUS: '/order/:id/status',

  USER_PROFILE: '/user/:id',

  SEARCH: '/search',

  SESSION_PARTICIPANTS_MANAGEMENT: '/admin/sessions/:id',
  SESSION_CANCELLING_USERS_MANAGEMENT: '/admin/sessions/:id/cancelling-users',

  EMAIL_LOGS: '/admin/email-logs',
  EMAIL_LOGS_ID: '/admin/email-logs/:id',
  EMAIL_NOTIFICATIONS: '/admin/email-notifications',
  EMAIL_NOTIFICATION_PREVIEW: '/admin/email-notifications/preview',
  EMAIL_FORMAT: '/admin/email-notifications/email-format',
  EMAIL_FORMAT_PREVIEW: '/admin/email-notifications/email-format/preview',
  EMAIL_LOG: '/admin/email-notifications/email-log',

  SYSTEM_ANNOUNCEMENT: '/admin/system-announcements',
  SYSTEM_ANNOUNCEMENT_CREATE: '/admin/system-announcements/create',
  SYSTEM_ANNOUNCEMENT_ID: '/admin/system-announcements/:id',

  PUSH_NOTIFICATIONS: '/admin/push-notifications',

  NOTIFICATION: '/notification',
};

export const CORPORATE_WEB_PATHS = {
  PRIVACY_POLICY: `${process.env.NEXT_PUBLIC_CORPORATE_WEB_BASE_URL}/privacy-policy`,
  TERMS_OF_USE: `${process.env.NEXT_PUBLIC_CORPORATE_WEB_BASE_URL}/terms-of-use`,
};

export default WEB_PATHS;
