import { Column, Entity, ManyToOne } from 'typeorm';
import { Language } from '../language/Language.entity';
import { Base } from '../base/Base.entity';

@Entity()
export class PromoBanner extends Base {
  @ManyToOne(() => Language, {
    eager: true,
    nullable: true,
    cascade: true,
    onDelete: 'SET NULL',
  })
  header: Language | null;

  @ManyToOne(() => Language, {
    eager: true,
    nullable: true,
    cascade: true,
    onDelete: 'SET NULL',
  })
  subtitle: Language | null;

  @ManyToOne(() => Language, {
    eager: true,
    nullable: true,
    cascade: true,
    onDelete: 'SET NULL',
  })
  cta: Language | null;

  @Column()
  assetKey: string;

  @Column({ nullable: true, type: 'text' })
  overlayColor?: string | null;

  @Column({ default: 'black' })
  textColor: string;

  @Column()
  href: string;

  @Column({ unique: true })
  sequence: number;
}
