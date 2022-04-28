import { IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MemberDetailDto } from './MemberDetail.dto';

export class UpdateMemberDto extends MemberDetailDto {
  @IsInt()
  @ApiProperty()
  Method: number;
}
