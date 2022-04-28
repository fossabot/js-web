export enum EmailNotificationSubCategoryKey {
  /**
   * Membership: Welcome to YourNextU. Please verify your email.
   */
  MEMBERSHIP_WELCOME = 'membershipWelcome',

  /**
   * Membership: Welcome to YourNextU. Please verify your email.
   */
  MEMBERSHIP_VERIFY_EMAIL = 'membershipVerifyEmail',

  /**
   * Membership: Your account almost expired, Renew to keep learning.
   */
  MEMBERSHIP_EXPIRY_REMINDER = 'membershipExpiryReminder',

  /**
   * Membership: Completed all courses? Keep Learning.
   */
  MEMBERSHIP_COMPLETED_ALL_COURSES = 'membershipCompletedAllCourses',

  /**
   * Membership: Set Password to access Central Learning Platform.
   */
  MEMBERSHIP_SET_PASSWORD = 'membershipSetPassword',

  /**
   * Membership: Reset password.
   */
  MEMBERSHIP_RESET_PASSWORD = 'membershipResetPassword',

  /**
   * Membership: Buy new package
   */
  MEMBERSHIP_BUY_NEW_PACKAGE = 'membershipBuyNewPackage',

  /**
   * Booking: Booking confirmation (F2F).
   */
  BOOKING_CONFIRMATION_F2F = 'bookingConfirmationF2F',

  /**
   * Booking: Booking confirmation (Virtual).
   */
  BOOKING_CONFIRMATION_VIRTUAL = 'bookingConfirmationVirtual',

  /**
   * Booking: Booking cancellation.
   */
  BOOKING_CANCELLATION = 'bookingCancellation',

  /**
   * Booking: Booking cancellation.
   */
  BOOKING_CANCELLATION_BY_ADMIN = 'bookingCancellationByAdmin',

  /**
   * Booking: Instructor changed.
   */
  BOOKING_INSTRUCTOR_CHANGED = 'bookingInstructorChanged',

  /**
   * Booking: Schedule changed.
   */
  BOOKING_SCHEDULE_CHANGED = 'bookingScheduleChanged',

  /**
   * Certificate: Certificate unlocked.
   */
  CERTIFICATE_UNLOCKED = 'certificateUnlocked',

  /**
   * Reminder: Quiz after session.
   */
  REMINDER_QUIZ_AFTER_SESSION = 'reminderQuizAfterSession',

  /**
   * Reminder: Remind to activate account.
   */
  REMINDER_ACTIVATE_ACCOUNT = 'reminderActivateAccount',

  /**
   * Reminder: Remind to book session (F2F)
   */
  REMINDER_BOOK_SESSION_F2F = 'reminderBookSessionF2F',

  /**
   * Reminder: Remind to book session (VIRTUAL)
   */
  REMINDER_BOOK_SESSION_VIRTUAL = 'reminderBookSessionVirtual',

  /**
   * Reminder: Remind to complete assigned learning track.
   */
  REMINDER_COMPLETE_ASSIGNED_LEARNING_TRACK = 'reminderCompleteAssignedLearningTrack',

  /**
   * Reminder: Remind to complete assigned course.
   */
  REMINDER_COMPLETE_ASSIGNED_COURSE = 'reminderCompleteAssignedCourse',

  /**
   * Reminder: Remind to do assessment
   */
  REMINDER_TODO_ASSESSMENT = 'reminderTodoAsessment',

  /**
   * Reminder: Remind to book session after 7 days inactive (last login/7 days from activation date)
   */
  REMINDER_BOOKING_AFTER_INACTIVE = 'reminderBookingAfterInactive',

  /**
   * Assignment: You have an assigned session. (F2F)
   */
  ASSIGNMENT_TO_SESSION_F2F = 'assignmentSessionF2F',

  /**
   * Assignment: You have an assigned session. (Virtual)
   */
  ASSIGNMENT_TO_SESSION_VIRTUAL = 'assignmentSessionVirtual',

  /**
   * Assignment: You have an assigned course.
   */
  ASSIGNMENT_TO_COURSE = 'assignmentCourse',

  /**
   * Assignment: You have an assigned learning track.
   */
  ASSIGNMENT_TO_LEARNING_TRACK = 'assignmentLearningTrack',
}
