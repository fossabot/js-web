import { Request } from 'express';
import { User } from './User.entity';
import { ExternalAuthProviderType } from './UserAuthProvider.entity';

export interface IUserWithProvider extends User {
  provider: ExternalAuthProviderType;
}

interface IRequestWithUser extends Request {
  user: User | IUserWithProvider;
}

export default IRequestWithUser;
