import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class AddStudentToSessionDto {
  @IsUUID('4', { each: true })
  @IsNotEmpty()
  @ApiProperty({ type: [String] })
  studentIds: string[];
}
