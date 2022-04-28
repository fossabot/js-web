import { ApiProperty } from '@nestjs/swagger';
import { User } from '@seaccentral/core/dist/user/User.entity';
import { BaseQueryDto } from '@seaccentral/core/dist/dto/BaseQuery.dto';
import { IsUUID } from 'class-validator';

export class GetUserOrdersQueryDto extends BaseQueryDto {
  @IsUUID('4')
  @ApiProperty()
  userId: User['id'];
}
