import { Column, Entity, PrimaryColumn } from 'typeorm';
import { Base } from '../base/Base.entity';

export enum LanguageCode {
  EN = 'en',
  TH = 'th',
}

@Entity()
export class Language extends Base {
  @PrimaryColumn()
  id: string;

  @Column({ type: 'text' })
  nameEn: string;

  @Column({ type: 'text', nullable: true })
  nameTh?: string;
}
