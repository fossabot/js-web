import { ApiPropertyOptional } from '@nestjs/swagger';
import { getPaginationRequestParams } from './BaseResponse.dto';

export type OrderType = 'ASC' | 'DESC';

export class BaseQueryDto {
  @ApiPropertyOptional()
  id?: string;

  @ApiPropertyOptional()
  page?: number;

  @ApiPropertyOptional()
  perPage?: number;

  @ApiPropertyOptional()
  q?: string;

  get take(): number {
    return getPaginationRequestParams(this).take;
  }

  get skip(): number {
    return getPaginationRequestParams(this).skip;
  }

  @ApiPropertyOptional()
  search: string;

  @ApiPropertyOptional()
  searchField: string;

  @ApiPropertyOptional()
  order: OrderType;

  @ApiPropertyOptional()
  orderBy: string;
}
