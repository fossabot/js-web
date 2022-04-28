import { createContext } from 'react';
import { IUser } from '../models/auth';

export interface IAuthContext {
  isLoading: boolean;
  policies: string[];
  token: {
    jwtToken: string;
    jwtTokenExpiry: string;
    user: IUser;
  };
}

export const AuthContext = createContext<IAuthContext | undefined>(undefined);
