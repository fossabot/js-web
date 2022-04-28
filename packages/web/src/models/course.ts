import * as Yup from 'yup';
import { Base } from './base';
import { CourseOutlineMediaPlaylist } from './courseOutlineMediaPlaylist';
import { Language } from './language';
import { Media } from './media';
import { UserCourseOutlineProgress } from './userCourseOutlineProgress';
import { groupBy } from 'lodash';
import {
  UserAssignedCourse,
  UserAssignedCourseType,
} from './userAssignedCourse';

export const getCourseOutlineInitialObj = () => ({
  title: {
    nameEn: '',
    nameTh: '',
  },
  part: 1,
  durationMinutes: 0,
  durationHours: 0,
  durationDays: 0,
  durationWeeks: 0,
  durationMonths: 0,
  categoryId: '',
  courseCode: '',
  learningWayId: '',
  outlineType: '',
  courseSessions: [],
  mediaPlaylist: [],
  description: {
    nameEn: '',
    nameTh: '',
  },
  learningContentFileKey: '',
  learningContentFiles: [],
  organizationId: '',
  thirdPartyPlatformUrl: '',
  thirdPartyCourseCode: '',
  providerName: '',
  timestamp: new Date().toISOString(), // To create unique key for react
  courseOutlineMediaPlayList: [],
  assessmentAPIEndpoint: '',
  assessmentName: '',
  assessmentNotifyEmailStatus: false,
  assessmentUserCanRetest: false,
});

export interface CourseCategory<Key> {
  id: string;
  name: string;
  key: Key;
  description?: string;
}

export enum CourseLanguage {
  TH = 'th',
  EN = 'en',
  ALL = 'all',
}

export enum CourseStatus {
  draft = 'draft',
  published = 'published',
}

export enum CourseCategoryKey {
  LEARNING_EVENT = 'learningEvent',
  ONLINE_LEARNING = 'onlineLearning',
  ASSESSMENT = 'assessment',
  MATERIAL = 'material',
}

export enum CourseSubCategoryKey {
  FACE_TO_FACE = 'faceToFace',
  VIRTUAL = 'virtual',
  SCORM = 'scorm',
  XAPI = 'xAPI',
  VIDEO = 'video',
  AUDIO = 'audio',
  LINK = 'link',
  ASSESSMENT = 'assessment',
  QUIZ = 'quiz',
  SURVEY = 'survey',
  DOCUMENT = 'document',
  PICTURE = 'picture',
}

export interface IUserEnrolledCourse {
  userId: string;
  courseId: string;
  percentage: number;
}

export interface ICourseSessionInstructor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImageKey?: string | null;
}

export interface ISessionBookings {
  id: string;
  userId: string;
  sessionId: string;
}

export interface ICourseSession {
  id: string;
  seats: number;
  availableSeats: number;
  webinarTool?: string | null;
  location?: string | null;
  participantUrl?: string | null;
  startDateTime: string;
  endDateTime: string;
  instructorsIds?: string[];
  instructors: ICourseSessionInstructor[];
  isDraft?: boolean;
  language?: string | null;
  courseOutlineId: string;
  courseOutline?: ICourseOutline;
  isBooked: boolean;
  sessionBookings: ISessionBookings[];
  isPrivate: boolean;
  courseTitle?: ICourse<Language>['title'];
  courseId?: ICourse<Language>['id'];
  courseOutlineTitle?: ICourseOutline<Language>['title'];
  courseOutlineCategory?: ICourseOutline<Language>['category'];
  courseOutlineLearningWay?: ICourseOutline<Language>['learningWay'];
  courseImageKey?: ICourse<Language>['imageKey'];
  courseTopics?: ICourse<Language>['topics'];
  hasCertificate?: boolean;
  isEnrolled?: boolean;
  instructorId?: string;
}

export interface ICourseSessionCalendar {
  startDateTime: string;
  endDateTime: string;
  id: ICourseSession['id'];
  instructors?: ICourseSessionInstructor[];
  location: ICourseSession['location'];
  language: ICourseSession['language'];
  seats: ICourseSession['seats'];
  courseOutlineId: ICourseOutline['id'];
  courseTitle?: ICourse<Language>['title'];
  courseId?: ICourse<Language>['id'];
  courseOutlineTitle?: ICourseOutline<Language>['title'];
  courseOutlineCategory?: ICourseOutline<Language>['category'];
  courseOutlineLearningWay?: ICourseOutline<Language>['learningWay'];
  courseImageKey?: ICourse<Language>['imageKey'];
  courseTopics?: ICourse<Language>['topics'];
}

export interface ICourseOutline<T extends Language | string = string> {
  id?: string;
  title?: T | null;
  courseCode: string;
  part: number;
  durationMinutes: number;
  durationHours: number;
  durationDays: number;
  durationWeeks: number;
  durationMonths: number;
  categoryId: string;
  outlineType: string;
  learningWayId: string;
  description?: T | null;
  providerName?: string | null;
  organizationId?: string | null;
  thirdPartyPlatformUrl?: string | null;
  thirdPartyCourseCode?: string | null;
  learningContentFile?: any | null;
  learningContentFileKey?: string | null;
  learningContentFiles?: File[] | null;
  courseSessions: ICourseSession[];
  mediaPlaylist: Media[];
  timestamp?: string;
  category?: CourseCategory<CourseSubCategoryKey>;
  learningWay?: any;
  organizationProvider?: any;
  course?: ICourse<T> | null;
  courseId?: string;
  courseOutlineMediaPlayList: CourseOutlineMediaPlaylist[];
  createdAt?: string;
  isBooked?: boolean;
  isBookingEligible?: boolean;
  userCourseOutlineProgress?: UserCourseOutlineProgress[];
  assessmentAPIEndpoint?: string;
  assessmentName?: string;
  assessmentNotifyEmailStatus?: boolean;
  assessmentUserCanRetest?: boolean;
  availableSessionCount?: number;
}

export interface ICourseOutlineDetail<T extends Language | string = string>
  extends ICourseOutline<T> {
  title?: T | null;
  description?: T | null;
  userCourseOutlineProgress: UserCourseOutlineProgress[];
  instructors?: ICourseSessionInstructor[];
  availableSessionCount?: number;
  totalSessionsBooked?: number;
}

export interface ICourse<T extends Language | string = string> {
  id?: string;
  title: T;
  tagLine?: T | null;
  categoryId: string;
  durationMinutes: number;
  durationHours: number;
  durationDays: number;
  durationWeeks: number;
  durationMonths: number;
  availableLanguage: CourseLanguage | string;
  description?: T | null;
  learningObjective?: T | null;
  courseTarget?: T | null;
  isPublic: boolean;
  status: CourseStatus | string;
  courseOutlines: ICourseOutline<T>[];
  tagIds: string[];
  materialIds: string[];
  topicIds: string[];
  topics?: any[];
  tags?: any[];
  materials?: any[];
  category?: CourseCategory<CourseCategoryKey>;
  createdAt?: any;
  imageFile: any;
  imageKey: string;
  featured?: boolean;
  hasCertificate?: boolean;
  userEnrolledCourse?: IUserEnrolledCourse[];
  userAssignedCourse?: Pick<UserAssignedCourse, 'assignmentType'>[];
}

export interface ICourseDetail<T extends Language | string = string>
  extends ICourse<T> {
  courseOutlines: ICourseOutlineDetail<T>[];
  isArchived?: boolean;
}

export enum CourseSessionBookingStatus {
  NO_MARK = 'NO_MARK',
  ATTENDED = 'ATTENDED',
  NOT_ATTENDED = 'NOT_ATTENDED',
  CANCELLED = 'CANCELLED',
}

export interface ICourseSessionBooking<T extends Language> extends Base {
  id: string;
  courseId: string;
  session: Omit<
    ICourseSession,
    | 'availableSeats'
    | 'instructorsIds'
    | 'sessionBookings'
    | 'isBooked'
    | 'isDraft'
  >;
  outline: Pick<ICourseOutline<T>, 'category' | 'title' | 'description'>;
  preRequisiteCourseId?: string;
}

export interface ICourseOutlineBundle<T extends Language> extends Base {
  name: string;
  courseOutline: Required<
    Pick<
      ICourseOutline<T>,
      | 'id'
      | 'createdAt'
      | 'courseCode'
      | 'part'
      | 'durationMinutes'
      | 'durationHours'
      | 'durationDays'
      | 'durationWeeks'
      | 'durationMonths'
      | 'courseId'
      | 'providerName'
      | 'thirdPartyPlatformUrl'
      | 'thirdPartyCourseCode'
      | 'categoryId'
      | 'title'
      | 'category'
      | 'description'
    >
  >[];
}

export interface PartialCourseOutlineBundle
  extends Omit<ICourseOutlineBundle<Language>, 'courseOutline'> {
  courseOutline: { id: string }[];
}

export interface UserEnrolledCourseStatuses {
  notStarted: number;
  inProgress: number;
  completed: number;
  archived: number;
}

export interface UserEnrolledCourseRaw {
  id: string;
  title: string;
  tagLine: string;
  durationMonths: number;
  durationWeeks: number;
  durationDays: number;
  durationHours: number;
  durationMinutes: number;
  availableLanguage: CourseLanguage;
  lessonLength: number;
  averagePercentage: number;
  categoryKey: CourseCategoryKey;
  imageKey: string;
  isArchived: boolean;
  firstCourseOutlineId: string;
  hasCertificate: boolean;
  userAssignedCourseType?: UserAssignedCourseType;
  dueDateTime: string;
}

export interface RelatedCoursesCancellationResponse<T extends Language> {
  course: Pick<ICourse<T>, 'imageKey'>;
  relatedBookings: {
    outline: Pick<ICourseOutline<T>, 'title'>;
    sessionId: string;
  }[];
}

export enum CourseSessionStatus {
  NOT_STARTED = 'not-started',
  IN_PROGRESS = 'in-progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum WebinarTool {
  ZOOM = 'Zoom',
  GOOGLE_MEET = 'Google Meet',
  MICROSOFT_TEAMS = 'Microsoft Teams',
  OTHERS = 'Others',
}

export const courseValidationSchema = Yup.object({
  title: Yup.object()
    .nullable()
    .shape({
      nameEn: Yup.string().trim().required('courseCreatePage.required'),
      nameTh: Yup.string().trim().optional(),
    }),
  tagLine: Yup.object().nullable().shape({
    nameEn: Yup.string().trim().optional(),
    nameTh: Yup.string().trim().optional(),
  }),
  categoryId: Yup.string().trim().required('courseCreatePage.required'),
  availableLanguage: Yup.string().trim().required('courseCreatePage.required'),
  description: Yup.object().nullable().shape({
    nameEn: Yup.string().trim().optional().nullable(),
    nameTh: Yup.string().trim().optional().nullable(),
  }),
  learningObjective: Yup.object().nullable().shape({
    nameEn: Yup.string().trim().optional().nullable(),
    nameTh: Yup.string().trim().optional().nullable(),
  }),
  courseTarget: Yup.object().nullable().shape({
    nameEn: Yup.string().trim().optional().nullable(),
    nameTh: Yup.string().trim().optional().nullable(),
  }),
  isPublic: Yup.boolean().required('courseCreatePage.required'),
  status: Yup.string().trim().required('courseCreatePage.required'),
  imageFile: Yup.object().optional().nullable(),
  imageKey: Yup.string().optional().nullable(),
  courseOutlines: Yup.array()
    .of(
      Yup.object().shape({
        title: Yup.object().shape({
          nameEn: Yup.string().trim().required('courseCreatePage.required'),
          nameTh: Yup.string().trim().optional().nullable(),
        }),
        part: Yup.number()
          .min(1, 'courseCreatePage.partMin')
          .required('courseCreatePage.required')
          .test(
            'courseOutlinePartUnique',
            'courseCreatePage.partShouldUnique',
            (part, context) => {
              const course = context['from'].map((it) => it.value)[1];

              const samePartsOutlines = course.courseOutlines.filter(
                (it) => it.part === part,
              );
              const outlineGroups = groupBy(
                samePartsOutlines,
                (outline) => outline.categoryId,
              );
              const isUnique = Object.keys(outlineGroups).every((key) => {
                return outlineGroups[key].length === 1;
              });

              return isUnique;
            },
          ),
        categoryId: Yup.string().trim().required('courseCreatePage.required'),
        outlineType: Yup.string().optional(),
        learningWayId: Yup.string()
          .trim()
          .required('courseCreatePage.required'),
        description: Yup.object().nullable().shape({
          nameEn: Yup.string().trim().optional().nullable(),
          nameTh: Yup.string().trim().optional().nullable(),
        }),
        providerName: Yup.string().optional(),
        courseCode: Yup.string().trim().required('courseCreatePage.required'),
        organizationId: Yup.string().when(['outlineType'], {
          is: (category) => category === 'link',
          then: Yup.string().required('courseCreatePage.required'),
          otherwise: Yup.string().optional().nullable(),
        }),
        thirdPartyPlatformUrl: Yup.string().when(['outlineType'], {
          is: (category) => category === 'link',
          then: Yup.string().required('courseCreatePage.required'),
          otherwise: Yup.string().optional(),
        }),
        thirdPartyCourseCode: Yup.string().when(['outlineType'], {
          is: (category) => category === 'link',
          then: Yup.string().required('courseCreatePage.required'),
          otherwise: Yup.string().trim().optional().nullable(),
        }),
        assessmentAPIEndpoint: Yup.string().when(['outlineType'], {
          is: (category) => category === 'assessment',
          then: Yup.string()
            .max(200, 'textAreaLengthError')
            .required('courseCreatePage.required'),
          otherwise: Yup.string().trim().optional().nullable(),
        }),
        assessmentName: Yup.string().when(['outlineType'], {
          is: (category) => category === 'assessment',
          then: Yup.string()
            .max(80, 'textAreaLengthError')
            .required('courseCreatePage.required'),
          otherwise: Yup.string().trim().optional().nullable(),
        }),
        assessmentNotifyEmailStatus: Yup.boolean().when(['outlineType'], {
          is: (category) => category === 'assessment',
          then: Yup.boolean().required('courseCreatePage.required'),
          otherwise: Yup.boolean().optional().nullable(),
        }),
        assessmentUserCanRetest: Yup.boolean().when(['outlineType'], {
          is: (category) => category === 'assessment',
          then: Yup.boolean().required('courseCreatePage.required'),
          otherwise: Yup.boolean().optional().nullable(),
        }),
        learningContentFile: Yup.object().optional().nullable(),
        learningContentFileKey: Yup.string().when(
          ['outlineType', 'learningContentFile'],
          {
            is: (category, learningContentFile) => {
              if (!learningContentFile && category === 'scorm') {
                return true;
              }
              return false;
            },
            then: Yup.string()
              .matches(/(imsmanifest.xml)/)
              .required('courseCreatePage.required'),
            otherwise: Yup.string().optional(),
          },
        ),
        courseSessions: Yup.array()
          .of(
            Yup.object().shape({
              seats: Yup.number()
                .min(1, 'courseCreatePage.seat')
                .required('courseCreatePage.required'),
              webinarTool: Yup.string().trim().optional().nullable(),
              location: Yup.string().trim().optional().nullable(),
              participantUrl: Yup.string()
                .url('courseCreatePage.url')
                .trim()
                .optional()
                .nullable(),
              language: Yup.string()
                .trim()
                .required('courseCreatePage.required'),
              startDateTime: Yup.string()
                .trim()
                .required('courseCreatePage.required'),
              endDateTime: Yup.string()
                .trim()
                .required('courseCreatePage.required'),
              instructorsIds: Yup.array()
                .of(Yup.string())
                .min(1, 'courseCreatePage.required'),
              isPrivate: Yup.boolean().required('courseCreatePage.required'),
            }),
          )
          .optional(),
        mediaPlaylist: Yup.array().optional(),
      }),
    )
    .min(1)
    .required('courseCreatePage.required'),
  tagIds: Yup.array().of(Yup.string()).optional(),
  materialIds: Yup.array().of(Yup.string()).optional(),
  topicIds: Yup.array()
    .of(Yup.string())
    .min(1, 'courseCreatePage.required')
    .required('courseCreatePage.required'),
});
