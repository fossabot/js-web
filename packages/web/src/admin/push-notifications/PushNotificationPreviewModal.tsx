import { useEffect, useRef, useState } from 'react';
import { usePrevious } from '../../hooks/usePrevious';
import useTranslation from '../../i18n/useTranslation';
import { LanguageCode } from '../../models/language';
import { INotification } from '../../models/notification';
import { NotificationItem } from '../../notification/NotificationItem';
import Button from '../../ui-kit/Button';
import { Modal } from '../../ui-kit/HeadlessModal';

interface IPushNotificationPreviewModal {
  data: INotification | null;
  onClose: () => void;
}

export const PushNotificationPreviewModal = ({
  data,
  onClose,
}: IPushNotificationPreviewModal) => {
  const { t } = useTranslation();
  const focusRef = useRef(null);
  const [pushNotification, setPushNotification] =
    useState<INotification | null>(undefined);
  const prevData = usePrevious(data);

  // allow to gracefully transition modal out without jank of suddenly not having content
  useEffect(() => {
    // prevData checking allows it to only run on changes and not on initialization
    if (prevData !== data) {
      if (data !== null) {
        setPushNotification(data);
      } else {
        setTimeout(() => {
          setPushNotification(null);
        }, 200); // same value as transition off duration of modal
      }
    }
  }, [data, prevData]);

  return (
    <Modal
      isOpen={data !== null}
      toggle={onClose}
      skipFullWidth
      initialFocusRef={focusRef}
      className="box-content px-6 py-8 lg:w-140"
      skipOutsideClickEvent
    >
      <div className="space-y-4">
        <h3 className="text-subheading font-semibold text-gray-900">
          {t('pushNotificationListPage.previewTitle')}
        </h3>

        {pushNotification && (
          <>
            <p className="text-gray-650">{pushNotification.title}</p>
            <NotificationItem
              categoryKey={pushNotification.category.key}
              content={pushNotification.content}
              createdAt={new Date().toISOString()}
              locale={LanguageCode.EN}
            />
            <NotificationItem
              categoryKey={pushNotification.category.key}
              content={pushNotification.content}
              createdAt={new Date().toISOString()}
              locale={LanguageCode.TH}
            />
          </>
        )}
      </div>

      <div className="flex justify-end">
        <Button
          ref={focusRef}
          avoidFullWidth
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
