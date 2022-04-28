import Link from 'next/link';
import { FunctionComponent } from 'react';
import { IconType } from 'react-icons';

const Button = ({ children, href }) => (
  <Link href={href}>
    <button className="outline-none focus:outline-none mb-3 w-full cursor-pointer rounded border border-black bg-white py-2 px-4 font-bold text-black focus:ring">
      {children}
    </button>
  </Link>
);

interface ISocialButton {
  url: string;
  Icon: IconType;
  text: string;
}
const SocialButton: FunctionComponent<ISocialButton> = ({
  url,
  Icon,
  text,
}) => (
  <Button href={url}>
    <div className="mr-4 inline-block align-middle">
      <Icon />
    </div>
    <div className="inline-block align-middle">{text}</div>
  </Button>
);

export default SocialButton;
