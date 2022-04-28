import { Entity, Column, Unique } from 'typeorm';
import { Base } from '../base/Base.entity';
import { TagType } from './TagType.enum';

@Entity()
@Unique('tag_unique', ['name', 'type', 'isActive'])
export class Tag extends Base {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({
    type: 'enum',
    enum: TagType,
    default: TagType.COURSE,
  })
  type: TagType;
}
