import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsArray } from 'class-validator';

export class UpdateRolePoliciesBody {
  @IsUUID('4', { each: true })
  @IsArray()
  @ApiProperty()
  policyIds: string[];
}
