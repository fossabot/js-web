import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class UserThirdPartyCoorpacademyProgress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  '#Username': string;

  @Column({ type: 'text', nullable: true })
  'Common Name': string | null;

  @Column({ type: 'text', nullable: true })
  'Engine': string | null;

  @Column({ type: 'text' })
  'Online course ID': string;

  @Column({ type: 'text', nullable: true })
  'Course Name': string | null;

  @Column({ type: 'text', nullable: true })
  'Course Level': string | null;

  @Column({ type: 'text', nullable: true })
  'Registration Date': string | null;

  @Column({ type: 'text', nullable: true })
  'Completion Date': string | null;

  @Column({ type: 'text' })
  Status: string;

  @Column({ type: 'text' })
  'Completed SCOs%': string;

  @Column({ type: 'text', nullable: true })
  'Time in Training (in min)': string | null;

  @Column({ type: 'text', nullable: true })
  'Stars earned': string | null;

  @Column({ type: 'text', nullable: true })
  'Live(s) remaining': string | null;

  @Column({ type: 'text', nullable: true })
  'Remaining Extra Life': string | null;

  @Column({ type: 'text', nullable: true })
  'Discipline ref': string | null;
}
