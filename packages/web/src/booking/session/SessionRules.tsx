import cx from 'classnames';
import { FC, ReactNode } from 'react';
import useTranslation from '../../i18n/useTranslation';
import { Clock, ContactCard, FileDuplicate } from '../../ui-kit/icons';

interface IRuleItem {
  className?: string;
  icon: ReactNode;
  heading: string;
  description: string;
}

const RuleItem: FC<IRuleItem> = ({ className, icon, heading, description }) => (
  <div className={cx('flex flex-row', className)}>
    {icon}
    <div className="flex flex-col">
      <p className="text-body font-semibold text-black">{heading}</p>
      <p className="text-caption font-regular text-gray-650">{description}</p>
    </div>
  </div>
);

const SessionRules: FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <p className="text-subtitle font-bold text-black">
        {t('courseBookingConfirmationPage.next')}
      </p>

      <div className="mt-4 border-t border-gray-200" />

      <div className="flex flex-col space-y-6">
        <RuleItem
          className="mt-4"
          heading={t('courseBookingConfirmationPage.ontime_heading')}
          description={t('courseBookingConfirmationPage.ontime_description')}
          icon={
            <Clock className="mr-4 mt-1 h-5 w-5 flex-shrink-0 text-gray-500" />
          }
        />
        <RuleItem
          className="mt-4"
          heading={t('courseBookingConfirmationPage.materials_heading')}
          description={t('courseBookingConfirmationPage.materials_description')}
          icon={
            <ContactCard className="mr-4 mt-1 h-5 w-5 flex-shrink-0 text-gray-500" />
          }
        />
        <RuleItem
          className="mt-4"
          heading={t('courseBookingConfirmationPage.assessments_heading')}
          description={t(
            'courseBookingConfirmationPage.assessments_description',
          )}
          icon={
            <FileDuplicate className="mr-4 mt-1 h-5 w-5 flex-shrink-0 text-gray-500" />
          }
        />
      </div>
    </>
  );
};

export default SessionRules;
