import { User } from './user';

export interface IEmailLog {
  id: string;
  html: string;
  text: string;
  user: Pick<User, 'id' | 'email'>;
  from: string;
  organizationName: string;
  category: string;
  subject: string;
  createdAt: string;
  awsMessageId: string;
}
