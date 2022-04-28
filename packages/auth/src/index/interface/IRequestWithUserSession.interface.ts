import { Request } from 'express';
import { UserSession } from '@seaccentral/core/dist/user/UserSession.entity';

interface IRequestWithUserSession extends Request {
  user: UserSession;
}

export default IRequestWithUserSession;
