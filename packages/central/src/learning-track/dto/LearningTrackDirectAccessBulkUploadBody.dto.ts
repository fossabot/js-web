/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { LearningTrackDirectAccess } from '@seaccentral/core/dist/learning-track/LearningTrackDirectAccess.entity';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class LearningTrackDirectAccessUploadFile {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  fileName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  key: string;
}

export class LearningTrackDirectAccessBulkUpload extends LearningTrackDirectAccess {
  @IsUUID('4')
  @IsNotEmpty()
  @ApiProperty()
  userId: string;

  @IsUUID()
  @IsNotEmpty()
  @ApiProperty()
  learningTrackId: string;
}

export class LearningTrackDirectAccessBulkUploadBody {
  learningTrackDirectAccess: LearningTrackDirectAccessBulkUpload[];

  metadata: LearningTrackDirectAccessUploadFile;
}
