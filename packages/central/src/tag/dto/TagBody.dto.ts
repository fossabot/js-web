import { ApiProperty } from '@nestjs/swagger';
import { TagType } from '@seaccentral/core/dist/tag/TagType.enum';
import { IsEnum, Length, Matches } from 'class-validator';

export class TagBody {
  @Matches(/^[a-z0-9-]+$/, {
    message:
      'Only lowercase characters, number and hyphen can be used for tag name.',
  })
  @Length(1, 50)
  @ApiProperty()
  name: string;

  @IsEnum(TagType)
  @ApiProperty()
  type: TagType;
}
