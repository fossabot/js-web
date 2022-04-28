export interface IUserNotification {
  id?: string;
  isActive: boolean;
  createdAt: string;
  isRead: boolean;
  notifyDate: string;
  notification: INotification;
}

export interface INotification {
  id?: string;
  isActive: boolean;
  createdAt: string;
  title: string;
  category: ICategory;
  content: IContent;
  triggerType?: {
    displayName: string;
  };
}

export interface ICategory {
  id?: string;
  isActive: boolean;
  createdAt: string;
  name: string;
  key: string;
  description: string;
  parent?: ICategory;
}

export interface IContent {
  id?: string;
  isActive: boolean;
  createdAt: string;
  nameEn: string;
  nameTh: string;
}

export enum NotificationCategoryKey {
  MEMBERSHIP = 'membership',
  ASSIGNMENT = 'assignment',
  LEARNING_ACTIVITY = 'learningActivity',
  REMINDER = 'reminder',
  CERTIFICATE = 'certificate',
  SYSTEM_ANNOUNCEMENT = 'systemAnnouncement',
}

export enum NotificationReceiverRole {
  MODERATOR = 'moderator',
  INSTRUCTOR = 'instructor',
  LEARNER = 'learner',
}

export interface INotificationVariable {
  name: string;
  alias: string;
  description: string;
  iterable: boolean;
}
