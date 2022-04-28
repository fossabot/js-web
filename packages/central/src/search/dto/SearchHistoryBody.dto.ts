import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

import { SearchType } from '@seaccentral/core/dist/search/UserSearchHistory.entity';

export class SearchHistoryBody {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  term: string;

  @IsOptional()
  @IsEnum(SearchType)
  @IsIn([SearchType.COURSE, SearchType.LEARNING_TRACK, SearchType.INSTRUCTOR])
  @ApiPropertyOptional()
  type? = SearchType.COURSE;
}
