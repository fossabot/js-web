import { ApiProperty } from '@nestjs/swagger';

export class GetSuggestionRequestDto {
  @ApiProperty()
  search = '';
}
