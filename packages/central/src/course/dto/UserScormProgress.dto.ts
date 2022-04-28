import { ApiProperty } from '@nestjs/swagger';
import { ScormVersion } from '@seaccentral/core/dist/scorm/ScormVersion.enum';
import { IsNullable } from '@seaccentral/core/dist/utils/custom-validator';
import { Transform, Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UserScormProgressDto {
  @Transform(({ value: metadata }) =>
    typeof metadata === 'object' ? metadata : { cmi: metadata },
  )
  @ApiProperty()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata: Record<string, any>;

  @Type(() => String)
  @IsString()
  @IsNullable()
  @ApiProperty()
  @Transform(({ value }) => value || '')
  @MaxLength(200)
  status: string;

  @Type(() => String)
  @IsString()
  @IsNullable()
  @ApiProperty()
  @Transform(({ value }) => value || '')
  @MaxLength(200)
  location: string;

  @Type(() => String)
  @IsString()
  @IsNullable()
  @ApiProperty()
  @Transform(({ value }) => value || '')
  suspend_data: string;

  @IsEnum(ScormVersion)
  @IsNotEmpty()
  @ApiProperty()
  version: string;
}
