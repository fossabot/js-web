import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';
import { CourseSessionManagementQueryDto } from './CourseSessionManagementQuery.dto';

export class CourseSessionManagementDetailQueryDto extends CourseSessionManagementQueryDto {
  @ApiProperty()
  @IsUUID('4', { each: true })
  courseId: string;
}
