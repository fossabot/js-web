const API_PATHS = {
  // AUTH
  LOGIN: '/v1/login',
  LOGOUT: '/v1/logout',
  VALIDATE: '/v1/validate',
  REFRESH_TOKEN: '/v1/refresh',
  LOCAL_SIGNUP: '/v1/signup/local',
  LOGIN_EXTERNAL: '/v1/login/external',
  INVITATION_SIGNUP: '/v1/signup/invitation',
  SETUP_ACCOUNT: '/v1/setup/account',
  LOGIN_SAML_REQUEST: '/v1/sso/saml/:token/login',
  THIRD_PARTY_SSO_PROVIDER_URL: '/v1/sso/saml/external-login-url/:planId',
  CHANGE_PASSWORD: '/v1/change-password',
  CONFIRM_EMAIL: 'v1/confirm-email',

  // CENTRAL
  ORGANIZATIONS: '/v1/organizations/',
  GET_ORGANIZATION_BY_ID: '/v1/organizations/:id',
  ORGANIZATION_USERS: '/v1/organizations/:id/users',
  ORGANIZATION_BULK_UPLOAD_USERS: '/v1/organizations/:id/upload-user',
  PREPARE_UPLOAD_IDP_METADATA:
    'v1/upload/file/organization/:id/idp-metadata/presigned-url',
  PREPARE_UPLOAD_IDP_CERTIFICATE:
    'v1/upload/file/organization/:id/idp-certificate/presigned-url',
  PREPARE_UPLOAD_SP_METADATA:
    'v1/upload/file/organization/:id/sp-metadata/presigned-url',
  PREPARE_UPLOAD_SP_CERTIFICATE:
    'v1/upload/file/organization/:id/sp-certificate/presigned-url',
  INVITATION: '/v1/invitation/',
  ADMIN_USERS: '/v1/admin/users',
  ADMIN_USERS_BY_EMAILS: '/v1/admin/users/emails',
  ADMIN_INVITED_USERS: '/v1/admin/users/invited',
  RESEND_INVITATION: '/v1/invitation/resend',
  ADMIN_SETTINGS_LOGIN: '/v1/admin/setting/login',
  ADMIN_SETTINGS_PASSWORD: '/v1/admin/setting/password',
  ADMIN_ACTIVATE_USERS: '/v1/admin/setting/activate/users',
  ADMIN_DEACTIVATE_USERS: '/v1/admin/setting/deactivate/users',
  ADMIN_UPLOAD_USER: '/v1/admin/setting/upload/user',
  ADMIN_USER_ROLE: '/v1/admin/user-role',
  VALIDATE_INVITATION_TOKEN: '/v1/invitation/:token/validate',
  ADMIN_UNLOCK_USERS: '/v1/admin/users/unlock',
  GET_SUBDISTRICT: '/v1/address/subdistrict',
  GET_DISTRICT: '/v1/address/district',
  GET_PROVINCE: '/v1/address/province',
  GET_ZIPCODE: 'v1/address/zipcode',
  GROUPS: '/v1/group',
  GROUPS_SEARCH: '/v1/group/search',
  GROUP_USERS: '/v1/group/:id/user',
  GROUP_DESCENDANTS: '/v1/group/:id/descendant',
  GROUP_DESCENDANT_USERS: '/v1/group/:id/descendant/user',
  GROUP_ID: 'v1/group/:id',
  ADD_USER_TO_GROUP: '/v1/group/:id/user/:userId',
  DELETE_GROUP: '/v1/group/:id',
  BULK_DELETE_GROUP_USERS: '/v1/group/bulk-delete-group-user',
  DOWNLOAD_GROUP_CSV: '/v1/group/nodes/csv',
  MY_BILLING_ADDRESS: '/v1/billing-address/me',
  PROFILE: '/v1/profile',
  PROFILE_ID: '/v1/profile/:id',
  PROFILE_AVATAR: '/v1/profile/avatar',
  PROFILE_EMAIL_NOTIFICATION_LANGUAGE:
    '/v1/profile/email-notification-language',
  COMPANY_SIZE_RANGES: '/v1/profession/companySizeRanges',
  INDUSTRIES: '/v1/profession/industries',
  COURSE_CATEGORIES: '/v1/course/categories',
  COURSE_SUB_CATEGORIES: '/v1/course/sub-categories',
  MATERIALS: '/v1/materials',
  MATERIALS_ID: '/v1/materials/:id',
  MATERIALS_DOWNLOAD_URL: '/v1/materials/:id/download-url',
  TAGS: '/v1/tags',
  COURSES: 'v1/course',
  COURSES_SEARCH: 'v1/course/search',
  COURSE_LEARNING_CONTENT: 'v1/course/learning-content/:id',
  ADMIN_COURSE_DETAIL: 'v1/course/:id',
  COURSE_DETAIL: 'v1/course/:id/detail',
  COURSE_ENROLL: 'v1/course/:id/enroll',
  COURSE_VALIDATE_PLAN: 'v1/course/:id/validate-subscription-plan',
  COURSE_LATEST_IN_PROGRESS: 'v1/course/me/latest-in-progress',
  COURSE_RULES: 'v1/course-rules',
  COURSE_RULE_DETAIL: 'v1/course-rules/:id',
  COURSE_RULES_COURSE_OUTLINES: 'v1/course-rules/course-outlines',
  COURSE_DIRECT_ACCESS: 'v1/course-direct-access',
  COURSE_DIRECT_ACCESS_DETAIL: 'v1/course-direct-access/:id',
  COURSE_DIRECT_ACCESS_BULK_UPLOAD: 'v1/course-direct-access/bulk-upload',
  COURSE_DIRECT_ACCESS_BULK_UPLOAD_HISTORY:
    'v1/course-direct-access/bulk-upload-history',
  COURSE_OUTLINES: 'v1/course-outlines',
  COURSE_OUTLINE_DETAIL: 'v1/course/course-outline/:id',
  COURSE_OUTLINE_BUNDLES: 'v1/course-outline-bundles/:id',
  COURSE_ID_COURSE_OUTLINES: 'v1/course/:id/course-outline',
  COURSE_OUTLINE_VALIDATE: 'v1/course-outlines/:id/validate',
  SCORM_PROGRESS: 'v1/course-outlines/:id/progress-scorm',
  VIDEO_PROGRESS: 'v1/course-outlines/:id/progress-video',
  COURSE_SESSIONS: 'v1/course-sessions',
  COURSE_SESSION_BY_ID: 'v1/course-sessions/:id',
  COURSE_SESSIONS_ME: 'v1/course-sessions/me',
  COURSE_SESSIONS_BOOKING: 'v1/course-sessions/booking/:bookingId',
  COURSE_SESSIONS_CALENDAR: 'v1/course-sessions/calendar',
  COURSE_SESSIONS_ATTENDANCE: 'v1/course-sessions/attendance',
  COURSE_SESSIONS_UPCOMING_ME: 'v1/course-sessions/:courseId/upcoming/me',
  BOOK_COURSE_SESSION: 'v1/course-sessions/:id/booking',
  COURSE_SESSION_VALIDATE: 'v1/course-sessions/:id/validate-booking-request',
  COURSE_SESSION_CALCELLING_VALIDATE:
    'v1/course-sessions/:id/validate-cancelling-request',
  COURSE_SESSION_ATTENDANTS: 'v1/course-sessions/:id/attendants',
  COURSE_SESSION_MARK_ATTENDANCE: 'v1/course-sessions/:id/mark-attendance',
  COURSE_SESSION_BULK_UPLOAD: 'v1/course-sessions/bulk-upload',
  COURSE_SESSION_BULK_UPLOAD_HISTORY: 'v1/course-sessions/bulk-upload-history',
  COURSE_SESSIONS_MANAGEMENT_COURSES: 'v1/course-session-management/courses',
  COURSE_SESSIONS_MANAGEMENT_SESSIONS:
    'v1/course-session-management/course-sessions',
  COURSE_SESSIONS_MANAGEMENT_SUGGESTIONS:
    'v1/course-session-management/suggestions',
  COURSE_SESSIONS_MANAGEMENT_EXPORT_REPORT:
    'v1/course-session-management/reports',
  COURSE_MATERIAL_DOWNLOAD: 'v1/course/:id/download-material/:materialId',
  COURSE_ALL_MEDIA: '/v1/course/:id/media',
  COURSE_LAST_SEEN_VIDEO: '/v1/course/:id/last-seen-video',
  COURSE_VIDEO_PROGRESS: '/v1/course/:id/video-progress',
  ENROLLED_COURSES: 'v1/user-courses/me',
  ENROLLED_COURSES_STATUSES: 'v1/user-courses/statuses',
  USER_ARCHRIVE_COURSES: 'v1/user-courses/archived-courses',
  ASSESSMENT_CENTER: 'v1/assessment-center/:courseOutlineId',
  COURSE_HAS_CERTIFICATE: 'v1/course/has-certificate',
  COURSE_SESSION_ACTIVE_ATTENDANTS: 'v1/course-sessions/:id/active-attendants',
  COURSE_SESSION_CANCELLATIONS: 'v1/course-sessions/:id/cancellations',
  COURSE_SESSION_ATTENDANTS_CANCELLATIONS:
    'v1/course-sessions/:id/attendants/cancellations',
  COURSE_SESSIONS_BOOKABLE_USERS: 'v1/course-sessions/:id/bookable-users',
  COURSE_SESSION_STUDENTS: 'v1/course-sessions/:id/students',
  COURSE_SESSION_PARTICIPANT_REPORTS:
    'v1/course-sessions/:id/participant-reports',

  USER_ASSIGNED_COURSES: 'v1/user-assigned-courses',
  USER_ASSIGNED_COURSES_ID: 'v1/user-assigned-courses/:id',
  USER_ASSIGNED_COURSES_BULK_UPLOAD: 'v1/user-assigned-courses/bulk-upload',
  USER_ASSIGNED_COURSES_BULK_UPLOAD_HISTORY:
    'v1/user-assigned-courses/bulk-upload-history',
  EMAIL_FORMAT_IMAGE: 'v1/email-format/images',
  EMAIL_FORMAT: 'v1/email-format',
  EMAIL_FORMAT_ID: 'v1/email-format/:id',
  EMAIL_NOTIFICATION: 'v1/email-notification',
  EMAIL_NOTIFICATION_ID: 'v1/email-notification/:id',
  UPDATE_EMAIL_NOTIFICATION_STATUS: 'v1/email-notification/:id/status',
  EMAIL_NOTIFICATION_SENDER_DOMAIN: '/v1/email-notification-sender-domain',

  USER_EMAIL_NOTIFICATIONS: 'v1/user-email-notifications',
  USER_EMAIL_NOTIFICATIONS_ID: 'v1/user-email-notifications/:id',
  USER_EMAIL_NOTIFICATIONS_COUNTS: 'v1/user-email-notifications/count',
  USER_EMAIL_NOTIFICATIONS_RESEND: 'v1/user-email-notifications/:id/resend',

  COURSE_DISCOVERY: 'v1/course-discovery',

  TOPICS: 'v1/topics',
  TOPICS_TREE: 'v1/topics/tree',
  LEARNING_WAYS: 'v1/learning_ways',
  LEARNING_WAYS_TREE: 'v1/learning_ways/tree',
  CATALOG_MENU: 'v1/catalog-menu',
  MEDIA: 'v1/media',
  MEDIA_ID: 'v1/media/:id',
  MEDIA_ID_SIGNED_URL: 'v1/media/:id/signed-url',
  MEDIA_PLAYER_URL: 'v1/media/player-url',
  ROLES: 'v1/roles',
  ROLE_BY_ID: 'v1/roles/:id',
  UPDATE_ROLE_POLICIES: '/v1/roles/:id/policies',
  POLICIES: 'v1/policies',
  GET_MY_POLICY: '/v1/policies/me',
  UPLOAD_SCORM_PRESIGNED: 'v1/scorm/presigned-url',
  SCORM_ACCESS_TOKEN: 'v1/scorm/access-token',
  SCORM_VERIFY_ACCESS: 'v1/scorm/verify-access/:courseOutlineId',
  SCORM_SIGNED_URL: 'v1/scorm/signed-url/:courseOutlineId',
  UPLOAD_COURSE_IMAGE_PRESIGNED: 'v1/upload/course/image/presigned-url',
  UPLOAD_LEARNING_TRACK_IMAGE_PRESIGNED:
    'v1/upload/learning-tracks/image/presigned-url',
  LEARNING_TRACKS: 'v1/learning-tracks',
  LEARNING_TRACKS_SEARCH: 'v1/learning-tracks/search',
  ADMIN_LEARNING_TRACK_DETAIL: 'v1/learning-tracks/:id',
  LEARNING_TRACK_DETAIL: 'v1/learning-tracks/:id/detail',
  LEARNING_TRACK_ENROLL: 'v1/learning-tracks/:id/enroll',
  LEARNING_TRACK_MATERIAL_DOWNLOAD:
    'v1/learning-tracks/:id/download-material/:materialId',
  ENROLLED_LEARNING_TRACKS: 'v1/user-learning-tracks/me',
  ENROLLED_LEARNING_TRACK_STATUSES: 'v1/user-learning-tracks/statuses',
  USER_ARCHRIVE_LEARNING_TRACK:
    'v1/user-learning-tracks/archived-learning-tracks',
  LEARNING_TRACK_HAS_CERTIFICATE: 'v1/learning-tracks/has-certificate',
  LEARNING_TRACK_DIRECT_ACCESS: 'v1/learning-tracks-direct-access',
  LEARNING_TRACK_DIRECT_ACCESS_DETAIL: 'v1/learning-tracks-direct-access/:id',
  LEARNING_TRACK_DIRECT_ACCESS_BULK_UPLOAD:
    'v1/learning-tracks-direct-access/bulk-upload',
  LEARNING_TRACK_DIRECT_ACCESS_BULK_UPLOAD_HISTORY:
    'v1/learning-tracks-direct-access/bulk-upload-history',

  USER_ASSIGNED_LEARNING_TRACK: 'v1/user-assigned-learning-tracks',
  USER_ASSIGNED_LEARNING_TRACK_ID: 'v1/user-assigned-learning-tracks/:id',
  USER_ASSIGNED_LEARNING_TRACK_BULK_UPLOAD:
    'v1/user-assigned-learning-tracks/bulk-upload',
  USER_ASSIGNED_LEARNING_TRACK_BULK_UPLOAD_HISTORY:
    'v1/user-assigned-learning-tracks/bulk-upload-history',

  USER_TAX_INVOICE: 'v1/tax-invoices/me',
  USER_TAX_INVOICE_ID: 'v1/tax-invoices/me/:id',
  PROMO_BANNER: 'v1/promo-banners',
  PROMO_BANNER_UPLOAD: 'v1/promo-banners/banners',
  INSTRUCTOR_PROFILE: 'v1/instructors/:id',
  INSTRUCTORS: 'v1/instructors',
  COURSE_ACTIVITIES_RECORDS_ME: 'v1/course-activities/records/me',

  // CERTIFICATES
  CERTIFICATES: 'v1/certificates',
  CERTIFICATES_ID: 'v1/certificates/:id',
  CERTIFICATE_DOWNLOAD: 'v1/certificates/:id/download-url',
  CERTIFICATES_ME: 'v1/certificates/me',
  CERTIFICATE_UNLOCK_RULES: 'v1/certificate-unlock-rules',
  CERTIFICATE_UNLOCK_RULE_DETAIL: 'v1/certificate-unlock-rules/:id',

  // UPLOAD
  GET_COURSE_SESSION_UPLOAD_FILE: 'v1/upload/file/course-session',
  GET_COURSE_DIRECT_ACCESS_UPLOAD_FILE: 'v1/upload/file/course-direct-access',
  GET_LEARNING_TRACK_DIRECT_ACCESS_UPLOAD_FILE:
    'v1/upload/file/learning-tracks-direct-access',
  GET_USER_UPLOAD_FILE: 'v1/upload/file/user',
  GET_UPLOAD_USER_PRESIGNED: 'v1/upload/file/user/presigned-url',
  GET_COURSE_SESSION_UPLOAD_PRESIGNED:
    'v1/upload/file/course-session/presigned-url',
  GET_COURSE_DIRECT_ACCESS_UPLOAD_PRESIGNED:
    'v1/upload/file/course-direct-access/presigned-url',
  GET_LEARNING_TRACK_DIRECT_ACCESS_UPLOAD_PRESIGNED:
    'v1/upload/file/learning-tracks-direct-access/presigned-url',
  GET_ORG_UPLOAD_IDP_CERT_PRESIGNED:
    'v1/upload/file/organization/:id/idp-cetificate/presigned-url',
  GET_ORG_UPLOAD_IDP_METADATA_PRESIGNED:
    'v1/upload/file/organization/:id/idp-metadata/presigned-url',
  GET_USER_ASSIGNED_COURSES_UPLOAD_PRESIGNED:
    'v1/upload/file/user-assigned-course/presigned-url',
  GET_USER_ASSIGNED_COURSES_UPLOAD_FILE: 'v1/upload/file/user-assigned-course',
  GET_USER_ASSIGNED_LEARNING_TRACK_UPLOAD_PRESIGNED:
    'v1/upload/file/user-assigned-learning-track/presigned-url',
  GET_USER_ASSIGNED_LEARNING_TRACK_UPLOAD_FILE:
    'v1/upload/file/user-assigned-learning-track',

  // Search
  SEARCH: 'v1/search',
  SEARCH_SUGGEST: 'v1/search/suggest',
  MY_SEARCH_HISTORIES: 'v1/search/histories/me',

  // PAYMENT
  PLANS: '/v1/plan',
  ALL_PLANS: '/v1/plan/all',
  PLAN_DETAIL: '/v1/plan/:planId',
  PLAN_DETAIL_ALL: '/v1/plan/:planId/all',
  INITIALIZE_PAYMENT: '/v1/initialize',
  LINK_PLAN_TO_EXTERNAL_PROVIDER:
    'v1/plan/:planId/link/organization/:organizationId',
  UNLINK_PLAN_TO_EXTERNAL_PROVIDER:
    'v1/plan/:planId/unlink/organization/:organizationId',
  FORGOT_PASSWORD: '/v1/forgot-password',
  RESET_PASSWORD: '/v1/reset-password',
  VALIDATE_PASSWORD_TOKEN: '/v1/validate-password-token',
  ORDER_PAYMENT_SUMMARY: '/v1/dashboard/payment',
  ORDER_PAYMENT_SUMMARY_CSV: '/v1/dashboard/payment/csv',
  ORDER_PAYMENT_STATUS: '/v1/order/:id/payment',
  ORDER_USER: 'v1/order/user',
  ORDER_ME: 'v1/order/me',
  MY_SUBSCRIPTIONS: '/v1/subscription/me',
  CART_PLAN: 'v1/cart/:planId',
  CART_COUPON: 'v1/cart/coupon',
  CART_COUPON_ID: 'v1/cart/coupon/:id',
  FRONTEND_CALLBACK: '/v1/gateway/callback/frontend',

  //NOTIFICATION
  USER_NOTIFICATION: '/v1/me',
  USER_UNREAD_NOTIFICATION_COUNT: '/v1/me/unread-count',
  USER_NOTIFICATION_MARK_ALL_READ: '/v1/me/mark-all-read',
  USER_NOTIFICATION_MARK_READ: '/v1/me/mark-read',

  PUSH_NOTIFICATIONS: '/v1/push-notifications',
  UPDATE_PUSH_NOTIFICATION_STATUS: '/v1/push-notifications/:id/status',

  ACTIVE_SYSTEM_ANNOUNCEMENT: '/v1/system-announcement/active',
  SYSTEM_ANNOUNCEMENT: '/v1/system-announcement',
  SYSTEM_ANNOUNCEMENT_IMAGES: '/v1/system-announcement/images',
  SYSTEM_ANNOUNCEMENT_ID: '/v1/system-announcement/:id',
  SYSTEM_ANNOUNCEMENT_DETAIL: '/v1/system-announcement/:id/detail',
  UPDATE_SYSTEM_ANNOUNCEMENT_STATUS: '/v1/system-announcement/:id/status',
};

export default API_PATHS;
