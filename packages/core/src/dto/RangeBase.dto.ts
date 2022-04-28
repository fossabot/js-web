import { ApiProperty } from '@nestjs/swagger';
import { RangeBase } from '../user/Range.entity';

export class RangeBaseDto extends RangeBase {
  @ApiProperty()
  start: number;

  @ApiProperty()
  end: number;

  @ApiProperty()
  nameEn: string;

  @ApiProperty()
  nameTh: string;

  @ApiProperty({ type: 'string', nullable: true })
  description: string | null;
}
