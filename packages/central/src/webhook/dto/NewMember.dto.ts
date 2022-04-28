import { IsNotEmpty, IsString, Matches, ValidateIf } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {
  EMAIL_PATTERN,
  TH_PHONE_REGEX,
} from '@seaccentral/core/dist/utils/constants';
import { MemberDetailDto } from './MemberDetail.dto';

export class NewMemberDto extends MemberDetailDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  Name: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  Lastname: string;

  @IsString()
  @ValidateIf((dto: NewMemberDto) => dto.Phone !== '')
  @Matches(TH_PHONE_REGEX)
  @ApiProperty()
  Phone: string;

  @IsString()
  @Matches(EMAIL_PATTERN)
  @IsNotEmpty()
  @ApiProperty()
  Email: string;

  @IsString()
  @ApiProperty()
  CompanyName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  MemberType: string;
}
