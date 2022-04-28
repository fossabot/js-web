import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import {
  UserUploadHistory,
  UserUploadProcessStatus,
} from '../user/UserUploadHistory.entity';
import { UserUploadType } from '../user/UserUploadType.enum';
import { BaseEntityFullDto } from './BaseEntity.dto';
import { UserDto } from './User.dto';

export class UserUploadHistoryDto extends IntersectionType(
  UserUploadHistory,
  BaseEntityFullDto,
) {
  @ApiProperty()
  file: string;

  @ApiProperty()
  isProcessed: boolean;

  @ApiProperty({ enum: UserUploadProcessStatus })
  status: UserUploadProcessStatus;

  @ApiProperty({ type: 'string', nullable: true })
  s3key: string;

  @ApiProperty({ enum: UserUploadType })
  uploadType: UserUploadType;

  @ApiProperty({ type: 'string', format: 'uuid' })
  organizationId!: string;

  @ApiProperty()
  user: UserDto;
}
