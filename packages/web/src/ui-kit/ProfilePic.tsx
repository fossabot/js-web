import { FC } from 'react';
import cx from 'classnames';
import config from '../config';
import { Avatar } from './icons';

export interface IProfilePic {
  imageKey?: string | null;
  className?: string;
  style?: any;
}

export const ProfilePic: FC<IProfilePic> = (props) => {
  const { imageKey, className, style } = props;

  if (!imageKey) {
    return <Avatar className={className} {...style} />;
  }
  return (
    <img
      style={style}
      className={cx('rounded-full object-contain', className)}
      src={`${config.CDN_BASE_URL}/${imageKey}`}
    />
  );
};
