/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { Language } from '@seaccentral/core/dist/language/Language.entity';

class CourseSession {
  @ApiProperty()
  startTime: Date;

  @ApiProperty()
  endTime: Date;

  @ApiProperty({ description: 'Number of all seats in a session' })
  seats: number;

  @ApiProperty({ description: 'Number of seats that has been booked' })
  booked: number;

  @ApiProperty()
  instructorIds: string[];

  @ApiProperty()
  id: string;

  @ApiProperty()
  cancelled: boolean;
}

export class CourseSessionDto {
  @ApiProperty()
  courseOutlines: {
    id: string;
    title?: Language | null;
    courseSessions: CourseSession[];
  }[];
}
