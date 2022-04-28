import { Entity, Column } from 'typeorm';

import { Base } from '../base/Base.entity';

@Entity()
export class Organization extends Base {
  // TODO: Make organization unique by something else
  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false, unique: true })
  slug: string;

  @Column({ nullable: true })
  logo?: string;

  @Column({ default: false })
  isIdentityProvider!: boolean;

  @Column({ default: false })
  isServiceProvider!: boolean;

  @Column({ default: false })
  showOnlySubscribedCourses: boolean;

  @Column({ default: false })
  disableUpgrade: boolean;
}
