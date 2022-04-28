import cx from 'classnames';
import { FC, MutableRefObject, ReactNode } from 'react';
import WEB_PATHS from '../constants/webPaths';
import useTranslation from '../i18n/useTranslation';
import ContentLineClampStyle from '../ui-kit/ContentLineClamp/contentLineClamp.module.css';
import { ArrowRight } from '../ui-kit/icons';
import { isMarkdownEmpty } from '../utils/isMarkdownEmpty';

interface IProfileDetailCard {
  markdown: string | null | undefined;
  heading: string;
  icon: ReactNode;
  className?: string;
  refProp?: MutableRefObject<HTMLDivElement>;
  isOwner: boolean;
}

const ProfileDetailCard: FC<IProfileDetailCard> = ({
  markdown,
  icon,
  heading,
  className,
  refProp,
  isOwner,
}) => {
  const { t } = useTranslation();

  const emptyComponent =
    isMarkdownEmpty(markdown) && isOwner ? (
      <div className="mt-4 mb-8 flex flex-row items-center text-brand-primary">
        <a className="text-caption font-semibold" href={WEB_PATHS.EDIT_PROFILE}>
          {t('publicUserProfilePage.setupProfile')}
        </a>
        <ArrowRight className="ml-2 h-4 w-4" />
      </div>
    ) : (
      <p className="pt-4 pb-8 text-caption font-regular text-gray-650">
        {t('publicUserProfilePage.unavailable')}
      </p>
    );

  return (
    <div
      className={cx('flex flex-col', className)}
      ref={refProp}
      style={{ scrollMarginTop: 146 }}
    >
      <div className="flex flex-row items-center text-black">
        {icon}
        <p className="ml-2 text-heading font-semibold">{heading}</p>
      </div>
      {!isMarkdownEmpty(markdown) ? (
        <div
          className={cx('pt-4 pb-8', ContentLineClampStyle.rte)}
          dangerouslySetInnerHTML={{
            __html: markdown,
          }}
        />
      ) : (
        emptyComponent
      )}
    </div>
  );
};

export default ProfileDetailCard;
