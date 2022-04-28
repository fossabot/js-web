/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

import { UserAssignedLearningTrack } from '@seaccentral/core/dist/learning-track/UserAssignedLearningTrack.entity';

export class UserAssignedLearningTrackUploadFile {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  fileName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  key: string;
}

export class UserAssignedLearningTrackBulkUpload extends UserAssignedLearningTrack {
  @IsUUID('4')
  @IsNotEmpty()
  @ApiProperty()
  userId: string;

  @IsUUID()
  @IsNotEmpty()
  @ApiProperty()
  learningTrackId: string;
}

export class UserAssignedLearningTrackBulkUploadBody {
  userAssignedLearningTracks: UserAssignedLearningTrackBulkUpload[];

  metadata: UserAssignedLearningTrackUploadFile;
}
