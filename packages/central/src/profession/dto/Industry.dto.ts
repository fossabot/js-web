import { IsIn, IsOptional } from 'class-validator';

export class IndustryDto {
  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  nameEn?: 'ASC' | 'DESC';

  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  nameTh?: 'ASC' | 'DESC';
}
