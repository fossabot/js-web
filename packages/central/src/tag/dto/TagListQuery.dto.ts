import { ApiProperty } from '@nestjs/swagger';
import { BaseQueryDto } from '@seaccentral/core/dist/dto/BaseQuery.dto';
import { TagType } from '@seaccentral/core/dist/tag/TagType.enum';
import { IsEnum, IsOptional } from 'class-validator';

export class TagListQueryDto extends BaseQueryDto {
  @IsEnum(TagType)
  @IsOptional()
  @ApiProperty()
  type?: TagType = TagType.COURSE;
}
