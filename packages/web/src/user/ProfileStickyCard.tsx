import cx from 'classnames';
import { FC, MutableRefObject, ReactNode } from 'react';

type CardProps = {
  ref?: MutableRefObject<HTMLDivElement>;
  icon: ReactNode;
  text: string;
};

interface IProfileStickyCard {
  className?: string;
  cardProps: CardProps[];
}

const ProfileStickyCard: FC<IProfileStickyCard> = ({
  className,
  cardProps,
}) => (
  <div
    className={cx(
      'sticky flex flex-col space-y-8 rounded-2xl border border-gray-200 bg-gray-100 p-4',
      className,
    )}
  >
    {cardProps.map((props, idx) => (
      <div
        key={`CardProps-${idx}`}
        className="group flex cursor-pointer flex-row items-center"
        ref={props.ref}
        onClick={() => {
          props.ref?.current
            ? props.ref.current.scrollIntoView({
                behavior: 'smooth',
              })
            : undefined;
        }}
      >
        {props.icon}
        <p className="ml-4 text-caption font-semibold text-gray-650 transition-colors group-hover:text-brand-primary">
          {props.text}
        </p>
      </div>
    ))}
  </div>
);

export default ProfileStickyCard;
