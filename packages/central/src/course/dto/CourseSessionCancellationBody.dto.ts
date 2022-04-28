import { ApiPropertyOptional } from '@nestjs/swagger';
import { User } from '@seaccentral/core/dist/user/User.entity';
import { IsArray, IsOptional, IsUUID } from 'class-validator';

export class CourseSessionCancellationBody {
  @IsUUID(4, { each: true })
  @IsArray()
  @IsOptional()
  @ApiPropertyOptional()
  userIds?: User['id'][];
}
