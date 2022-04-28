import { ApiPropertyOptional } from '@nestjs/swagger';
import { Gender } from '@seaccentral/core/dist/user/Gender.enum';
import { UserTitle } from '@seaccentral/core/dist/user/userTitle.enum';
import { IsNullable } from '@seaccentral/core/dist/utils/custom-validator';
import { Transform } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsNullable()
  @IsEnum(UserTitle)
  @ApiPropertyOptional({ enum: UserTitle, description: 'Send null to unset' })
  title?: UserTitle | null;

  @IsOptional()
  @IsNullable()
  @IsEnum(Gender)
  @ApiPropertyOptional({ enum: Gender, description: 'Send null to unset' })
  gender?: Gender | null;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @ApiPropertyOptional()
  firstName?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @ApiPropertyOptional()
  lastName?: string;

  @IsOptional()
  @IsNullable()
  @IsDate()
  @Transform(({ value }) => (value ? new Date(value) : undefined))
  @ApiPropertyOptional({
    type: 'string',
    description: 'date of birth format dd/mm/yyyy. Send null to unset',
  })
  dob?: Date | null;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @ApiPropertyOptional()
  lineId?: string;
}
