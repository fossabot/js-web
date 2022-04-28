import { FaGoogle, FaFacebook, FaLinkedin } from 'react-icons/fa';

import config from '../config';
import SocialButton from '../ui-kit/SocialButton';

const { AUTH_API_BASE_URL } = config;

const socialButtonContent = [
  {
    Icon: FaGoogle,
    url: `${AUTH_API_BASE_URL}/social/google`,
    text: 'Sign up with Google',
  },
  {
    Icon: FaFacebook,
    url: `${AUTH_API_BASE_URL}/social/facebook`,
    text: 'Sign up with Facebook',
  },
  {
    Icon: FaLinkedin,
    url: `${AUTH_API_BASE_URL}/social/linkedin`,
    text: 'Sign up with LinkedIn',
  },
];

const SocialButtons = () => (
  <div>
    {socialButtonContent.map((socialButton) => (
      <SocialButton
        key={socialButton.url}
        url={socialButton.url}
        Icon={socialButton.Icon}
        text={socialButton.text}
      />
    ))}
  </div>
);

export default SocialButtons;
