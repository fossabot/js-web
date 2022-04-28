export interface SocialUserDto<T> {
  accessToken: string;
  refreshToken?: string;
  profile: T;
}
