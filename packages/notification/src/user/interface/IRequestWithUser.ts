import { Request } from 'express';
import { User } from '@seaccentral/core/dist/user/User.entity';
import { ExternalAuthProviderType } from '@seaccentral/core/dist/user/UserAuthProvider.entity';

export interface IUserWithProvider extends User {
  provider: ExternalAuthProviderType;
}
interface IRequestWithUser extends Request {
  user: User | IUserWithProvider;
}
export default IRequestWithUser;
