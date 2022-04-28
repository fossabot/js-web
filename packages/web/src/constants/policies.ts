// https://docs.google.com/spreadsheets/d/1HxDswVzxlqWSLNcFC2YkwNUs9KjTqCzt_-KjBuMTd9I/edit#gid=213044681
// https://docs.google.com/document/d/1A3DVx9s7-iW5A7UG8vEG4lPb2e5Ejd8oUlF-2LmrOI8/edit

export enum GOD_MODE {
  GRANT_ALL_ACCESS = 'grantAllAccess',
}

export enum BACKEND_ADMIN_CONTROL {
  ACCESS_ADMIN_PORTAL = 'accessAdminPortal',
  ACCESS_CATALOG_MENU_MANAGEMENT = 'accessCatalogMenuManagement',
  ACCESS_COURSE_MANAGEMENT = 'accessCourseManagement',
  ACCESS_CERTIFICATE_MANAGEMENT = 'accessCertificateManagement',
  ACCESS_GROUP_MANAGEMENT = 'accessGroupManagement',
  ACCESS_USER_INVATATION_MANAGEMENT = 'accessUserInvitationManagement',
  ACCESS_LEARNING_TRACK_MANAGEMENT = 'accessLearningTrackManagement',
  ACCESS_LEARNING_WAY_MANAGEMENT = 'accessLearningWayManagement',
  ACCESS_LINKED_PLANS = 'accessLinkedPlans',
  ACCESS_LOGIN_SETTINGS = 'accessLoginSettings',
  ACCESS_MATERIAL_MANAGEMENT = 'accessMaterialManagement',
  ACCESS_ORGANIZATION_MANAGEMENT = 'accessOrganizationManagement',
  ACCESS_PASSWORD_SETTINGS = 'accessPasswordSettings',
  ACCESS_PAYMENT_DASHBOARD = 'accessPaymentDashboard',
  ACCESS_PLAN_MANAGEMENT = 'accessPlanManagement',
  ACCESS_TAG_MANAGEMENT = 'accessTagManagement',
  ACCESS_TOPIC_MANAGEMENT = 'accessTopicManagement',
  ACCESS_USER_MANAGEMENT = 'accessUserManagement',
  ACCESS_USER_UPLOAD = 'accessUserUpload',
  ACCESS_VIDEO_MANAGEMENT = 'accessVideoManagement',
  ACCESS_CLASS_ATTENDANCE = 'accessClassAttendance',
  ACCESS_ALL_CLASS_ATTENDANCE = 'accessAllClassAttendance',
  ACCESS_PROMO_BANNER = 'accessPromoBanner',
  ACCESS_COURSE_DISCOVERY_MANAGEMENT = 'accessCourseDiscoveryManagement',
  ACCESS_EMAIL_NOTIFICATIONS = 'accessEmailNotifications',
  ACCESS_SYSTEM_ANNOUNCEMENT_MANAGEMENT = 'accessSystemAnnouncementManagement',
  ACCESS_PUSH_NOTIFICATION_MANAGEMENT = 'accessPushNotificationManagement',
}

export type PolicyEnum = GOD_MODE | BACKEND_ADMIN_CONTROL;
