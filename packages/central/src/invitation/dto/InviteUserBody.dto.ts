import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { EMAIL_PATTERN } from '@seaccentral/core/dist/utils/constants';

export class InviteUserBody {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  lastName: string;

  @Matches(EMAIL_PATTERN)
  @IsNotEmpty()
  @ApiProperty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  organization: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  role: string;
}
