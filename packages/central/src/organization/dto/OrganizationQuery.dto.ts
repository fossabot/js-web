import { ApiPropertyOptional } from '@nestjs/swagger';
import { BaseQueryDto } from '@seaccentral/core/dist/dto/BaseQuery.dto';
import { IsIn, IsOptional } from 'class-validator';

export class OrganizationQueryDto extends BaseQueryDto {
  @IsOptional()
  @IsIn(['csv'])
  @ApiPropertyOptional({
    description:
      'Can be "csv" to download as file or blank to get JSON response',
  })
  format?: string;
}
