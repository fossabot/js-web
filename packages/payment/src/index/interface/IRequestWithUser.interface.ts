import { Request } from 'express';
import { User } from '@seaccentral/core/dist/user/User.entity';

interface IRequestWithUser extends Request {
  user: User;
}

export default IRequestWithUser;
