export enum PushNotificationSubCategoryKey {
  /**
   * Learning Activity: Course Enrollment (added to Dashboard).
   */
  LEARNING_ACTIVITY_COURSE_ENROLLMENT = 'learningActivityCourseEnrollment',

  /**
   * Learning Activity: Course Completion (status).
   */
  LEARNING_ACTIVITY_COURSE_COMPLETION = 'learningActivityCourseCompletion',

  /**
   * Learning Activity: Learning Track Enrollment (added to Dashboard).
   */
  LEARNING_ACTIVITY_LEARNING_TRACK_ENROLLMENT = 'learningActivityLearningTrackEnrollment',

  /**
   * Learning Activity: Learning Track Completion (status).
   */
  LEARNING_ACTIVITY_LEARNING_TRACK_COMPLETION = 'learningActivityLearningTrackCompletion',

  /**
   * Learning Activity: Booking made.
   */
  LEARNING_ACTIVITY_SESSION_BOOKED = 'learningActivitySessionBooked',

  /**
   * Learning Activity: Booking cancellation by user.
   */
  LEARNING_ACTIVITY_BOOKING_CANCELLED_BY_USER = 'learningActivityBookingCancelledByUser',

  /**
   * Learning Activity: Session cancelled by admin
   */
  LEARNING_ACTIVITY_SESSION_CANCELLED_BY_ADMIN = 'learningActivitySessionCancelledByAdmin',

  /**
   * Learning Activity: Course cancelled by admin.
   */
  LEARNING_ACTIVITY_BOOKING_CANCELLED_BY_ADMIN = 'learningActivityBookingCancelledByAdmin',

  /**
   * Assignment: You have an assigned session.
   */
  ASSIGNMENT_TO_SESSION = 'assignmentSession',

  /**
   * Assignment: You have an assigned course.
   */
  ASSIGNMENT_TO_COURSE = 'assignmentCourse',

  /**
   * Assignment: You have an assigned learning track.
   */
  ASSIGNMENT_TO_LEARNING_TRACK = 'assignmentLearningTrack',

  /**
   * Membership: Membership renewal.
   */
  MEMBERSHIP_RENEWAL = 'membershipRenewal',

  /**
   * Membership: New Membership activates.
   */
  MEMBERSHIP_ACTIVATED = 'membershipActivated',

  /**
   * Membership: Membership expiring reminder.
   */
  MEMBERSHIP_EXPIRING_REMINDER = 'membershipExpiringRemider',

  /**
   * Certificate: Certificate unlocked.
   */
  CERTIFICATE_UNLOCKED = 'certificateUnlocked',

  /**
   * Reminder: Remind to complete required course.
   */
  REMINDER_COMPLETE_REQUIRED_COURSE = 'reminderCompleteRequiredCourse',

  /**
   * Reminder: Remind to complete assigned learning track.
   */
  REMINDER_COMPLETE_REQUIRED_LEARNING_TRACK = 'reminderCompleteRequiredLearningTrack',

  /**
   * Reminder: Upcoming event in X days (booked)
   */
  REMINDER_UPCOMING_BOOKED_EVENTS = 'reminderUpcomingBookedEvent',

  /**
   * Reminder: Assessment result required for XXX session (7,1 day(s) before session)
   */
  REMINDER_ASSESSMENT_RESULT_REQUIRED = 'reminderAssessmentResultRequired',

  /**
   * Reminder: New Assessment unlocked
   */
  REMINDER_ASSESSMENT_UNLOCKED = 'reminderAssessmentUnlocked',

  /**
   * System Anouncement: System Anouncement
   */
  SYSTEM_ANNOUNCEMENT = 'systemAnnouncement',
}
