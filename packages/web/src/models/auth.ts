import { Dispatch, SetStateAction } from 'react';
import { Role } from './role';

export interface IUser {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  profileImageKey?: string;
  username?: string;
  isEmailConfirmed?: boolean;
  isTwoFactorEnabled?: boolean;
  isActive: boolean;
  isActivated: boolean;
  defaultRole?: Role;
}

export interface ITokenObject {
  jwtToken: string;
  jwtTokenExpiry: string;
  user: IUser;
}

export interface ITokenProps {
  token: ITokenObject;
}

export interface IAuthRedirectionContext {
  setUser: Dispatch<SetStateAction<IUser>>;
  user: IUser;
}
