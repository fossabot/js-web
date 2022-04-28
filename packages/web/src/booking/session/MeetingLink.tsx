import { FC, useState } from 'react';
import useTranslation from '../../i18n/useTranslation';
import { Check, ClipboardCopy } from '../../ui-kit/icons';

interface IMeetingLink {
  link: string;
}

const MeetingLink: FC<IMeetingLink> = ({ link }) => {
  const { t } = useTranslation();

  const [isCopied, setCopied] = useState<boolean>(false);

  const onClickCopy = () => {
    try {
      navigator.clipboard.writeText(link);
      setCopied(true);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      <p className="text-caption font-semibold text-gray-650">
        {t('courseBookingConfirmationPage.meetingLink')}
      </p>
      <div className="relative mt-3 flex w-full flex-row">
        <input
          className="outline-none w-full truncate rounded-lg border border-gray-200 py-3 pl-4 pr-20 text-caption font-regular text-gray-650"
          name="externalLink"
          value={link}
          readOnly
        />
        <button
          className="active:outline-none focus:outline-none absolute right-5 top-1/2 flex -translate-y-1/2 transform-gpu cursor-pointer flex-row items-center py-4 text-gray-650"
          onClick={() => onClickCopy()}
        >
          {isCopied ? (
            <Check className="mr-1 h-4 w-4 text-green-300" />
          ) : (
            <ClipboardCopy className="mr-1 h-4 w-4" />
          )}
          <p className="text-footnote font-semibold">
            {isCopied
              ? t('courseBookingConfirmationPage.copied')
              : t('courseBookingConfirmationPage.copy')}
          </p>
        </button>
      </div>
    </>
  );
};

export default MeetingLink;
