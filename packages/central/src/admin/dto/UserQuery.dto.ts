import { ApiPropertyOptional } from '@nestjs/swagger';
import { BaseQueryDto } from '@seaccentral/core/dist/dto/BaseQuery.dto';
import { SYSTEM_ROLES } from '@seaccentral/core/dist/utils/constants';
import { IsIn, IsOptional } from 'class-validator';

type Roles = keyof typeof SYSTEM_ROLES;

export class UserQueryDto extends BaseQueryDto {
  @IsIn(Object.keys(SYSTEM_ROLES))
  @IsOptional()
  @ApiPropertyOptional()
  role?: Roles | null;
}
