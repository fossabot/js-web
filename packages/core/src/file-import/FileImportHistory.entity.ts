import { Column, Entity } from 'typeorm';
import { Base } from '../base/Base.entity';

@Entity()
export class FileImportHistory extends Base {
  @Column({ type: 'text' })
  key: string;

  @Column({ type: 'text', nullable: true })
  note?: string | null;

  @Column({ type: 'text' })
  source: string;
}
