import {
  IsBooleanString,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
} from 'class-validator';

export type CourseSessionCalendarQueryFields =
  | 'courseOutlineTitle'
  | 'courseOutlineCategory'
  | 'courseOutlineLearningWay'
  | 'instructors'
  | 'availableSeats'
  | 'isBooked'
  | 'courseTitle'
  | 'courseTopics'
  | 'hasCertificate'
  | 'courseImageKey';

export class CourseSessionCalendarQuery {
  @IsDateString()
  @IsNotEmpty()
  @IsOptional()
  startTime?: string;

  @IsDateString()
  @IsNotEmpty()
  @IsOptional()
  endTime?: string;

  @IsNotEmpty()
  @IsOptional()
  courseOutlineId?: string;

  @IsBooleanString()
  @IsOptional()
  onlyEnrolled?: 'true' | 'false';

  @IsOptional()
  fields?: CourseSessionCalendarQueryFields[];

  @IsUUID(4)
  @IsOptional()
  instructorId?: string;
}
