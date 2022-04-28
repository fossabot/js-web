import { Dialog } from '@headlessui/react';
import { Dispatch, FC, useCallback, useRef, useState } from 'react';
import Button from '../ui-kit/Button';
import { Modal } from '../ui-kit/HeadlessModal';
import { ZoomIn, ZoomOut } from '../ui-kit/icons';
import Slider from '../ui-kit/Slider';
import Cropper from 'react-easy-crop';
import { Area, Point, Size } from 'react-easy-crop/types';
import useTranslation from '../i18n/useTranslation';

export interface IUploadAvatarModal {
  isOpen: boolean;
  toggle: Dispatch<boolean>;
  onOk: (croppedAreaPixels: Area, imageSrc: string) => void;
  preview: string;
  isSaving?: boolean;
}

export const UploadAvatarModal: FC<IUploadAvatarModal> = (props) => {
  const { isOpen, toggle, onOk, preview, isSaving } = props;
  const initialFocusRef = useRef(null);
  const [zoom, setZoom] = useState<number>(2);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const { t } = useTranslation();
  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);
  const viewportSize: Size = { width: 170, height: 170 };

  return (
    <Modal
      {...{ toggle, isOpen, initialFocusRef }}
      skipOutsideClickEvent={isSaving}
      className="px-5 py-6 lg:w-80"
    >
      <Dialog.Overlay />
      <div
        className="relative top-0 left-0 h-48 w-full"
        style={{ clipPath: `circle(${viewportSize.width / 2}px at center)` }}
      >
        <Cropper
          image={preview}
          cropSize={viewportSize}
          crop={crop}
          zoom={zoom}
          aspect={1}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
          cropShape="round"
          showGrid={false}
          restrictPosition
        />
      </div>
      <div className="mt-6 flex justify-center text-caption text-gray-500">
        {t('profilePage.avatarModal.dragToRepositionPhoto')}
      </div>
      <div className="mt-6 flex items-center space-x-5">
        <ZoomOut />
        <Slider
          value={zoom}
          min={1}
          max={3}
          step={0.01}
          onChange={(evt) => setZoom(Number(evt.target.value))}
        />
        <ZoomIn />
      </div>
      <div className="mt-8 space-y-4 lg:flex lg:flex-row-reverse lg:space-y-0">
        <div className="max-w-25 lg:ml-3">
          <Button
            ref={initialFocusRef}
            size="medium"
            variant="primary"
            className="font-semibold text-white"
            onClick={() => onOk(croppedAreaPixels, preview)}
            isLoading={isSaving}
            disabled={isSaving}
          >
            {t('profilePage.avatarModal.saveChanges')}
          </Button>
        </div>
        <div className="max-w-25">
          <Button
            size="medium"
            variant="secondary"
            className="font-semibold"
            onClick={() => {
              if (!isSaving) toggle(false);
            }}
            disabled={isSaving}
          >
            {t('profilePage.avatarModal.cancel')}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
