import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class UserRole {
  @IsUUID('4')
  @IsNotEmpty()
  @ApiProperty()
  userId: string;

  @IsUUID('4')
  @IsNotEmpty()
  @ApiProperty()
  roleId: string;
}
