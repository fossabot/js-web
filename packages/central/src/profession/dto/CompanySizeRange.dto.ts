import { IsIn, IsOptional } from 'class-validator';

export class CompanySizeRangeDto {
  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  start?: 'ASC' | 'DESC';

  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  end?: 'ASC' | 'DESC';
}
