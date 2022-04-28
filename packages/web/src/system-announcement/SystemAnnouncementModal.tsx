import { format } from 'date-fns';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import { usePrevious } from '../hooks/usePrevious';
import { useResponsive } from '../hooks/useResponsive';
import useTranslation from '../i18n/useTranslation';
import { Language, LanguageCode } from '../models/language';
import { ISystemAnnouncement } from '../models/systemAnnouncement';
import Button from '../ui-kit/Button';
import { Modal } from '../ui-kit/HeadlessModal';

type ModalSystemAnnouncement = Pick<
  ISystemAnnouncement,
  | 'imageKey'
  | 'title'
  | 'message'
  | 'messageEndDateTime'
  | 'messageStartDateTime'
>;

interface ISystemAnnouncementModalProps {
  data: ModalSystemAnnouncement | null;
  onClose: () => void;
  locale?: string;
  isLocalImage?: boolean;
}

export const SystemAnnouncementModal = ({
  data,
  onClose,
  locale,
  isLocalImage = false,
}: ISystemAnnouncementModalProps) => {
  const { t } = useTranslation();
  const { lg } = useResponsive();
  const focusRef = useRef(null);
  const [announcement, setAnnouncement] =
    useState<ModalSystemAnnouncement | null>(undefined);
  const prevData = usePrevious(data);
  const { locale: routerLocale } = useRouter();

  const displayLocale = locale || routerLocale;

  // allow to gracefully transition modal out without jank of suddenly not having content
  useEffect(() => {
    // prevData checking allows it to only run on changes and not on initialization
    if (prevData !== data) {
      if (data !== null) {
        setAnnouncement(data);
      } else {
        setTimeout(() => {
          setAnnouncement(null);
        }, 200); // same value as transition off duration of modal
      }
    }
  }, [data, prevData]);

  const localeText = (text?: Language | null): string => {
    if (displayLocale === LanguageCode.TH) return text.nameTh || text.nameEn;
    return text.nameEn;
  };

  return (
    <Modal
      isOpen={data !== null}
      toggle={onClose}
      skipFullWidth
      initialFocusRef={focusRef}
      className="box-content px-6 py-8 lg:w-140"
      skipOutsideClickEvent
    >
      {announcement && (
        <>
          {announcement.imageKey && (
            <div className="mb-8 flex justify-center">
              <img
                className="max-h-92 max-w-64 object-contain"
                alt={localeText(announcement.title)}
                src={
                  isLocalImage
                    ? announcement.imageKey
                    : `${process.env.NEXT_PUBLIC_CDN_BASE_URL}/${announcement.imageKey}`
                }
              />
            </div>
          )}
          {announcement.title && (
            <div
              className="mb-6 text-center text-subtitle font-bold text-brand-primary"
              dangerouslySetInnerHTML={{
                __html: localeText(announcement.title),
              }}
            />
          )}
          {announcement.messageStartDateTime &&
            announcement.messageEndDateTime && (
              <h6 className="mb-6 text-center text-heading font-semibold">
                {`${format(
                  new Date(announcement.messageStartDateTime),
                  'dd MMM yy HH:mm',
                )} - ${format(
                  new Date(announcement.messageEndDateTime),
                  'dd MMM yy HH:mm',
                )}`.toUpperCase()}
              </h6>
            )}
          {announcement.message && (
            <div
              className="mb-8 text-caption text-gray-650"
              dangerouslySetInnerHTML={{
                __html: localeText(announcement.message),
              }}
            />
          )}
        </>
      )}
      <div className="flex justify-center">
        <Button
          ref={focusRef}
          avoidFullWidth={lg}
          size="medium"
          variant="secondary"
          onClick={() => onClose()}
        >
          {t('close')}
        </Button>
      </div>
    </Modal>
  );
};
