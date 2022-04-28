import bytes from 'bytes';
import { useEffect, useState } from 'react';

import config from '../../config';

export function useImageUpload(imageKey?: string) {
  const [imagePreview, setImagePreview] = useState(null);
  const [imageError, setImageError] = useState('');

  useEffect(() => {
    if (imageKey) {
      setImagePreview(`${config.CDN_BASE_URL}/${imageKey}`);
    }
  }, [imageKey]);

  const handleImageChange = (files: FileList, key: string, callback: any) => {
    if (files.length <= 0) {
      setImagePreview(imageKey ? `${config.CDN_BASE_URL}/${imageKey}` : null);
      callback(false);
      return;
    }
    const file = files[0];
    if (file.size > bytes.parse('5 MB')) {
      setImageError('learningTrackForm.imageSizeExceedLimit');
      callback(false);
    } else {
      const reader = new FileReader();
      reader.onload = function (e) {
        const img = new Image();
        img.onload = function () {
          if (img.width !== 512 || img.height !== 512) {
            setImageError('learningTrackForm.imageResolutionNotSupport');
            setImagePreview(null);
            callback(false);
            return;
          }
          setImageError('');
          setImagePreview(e.target.result);
        };
        img.src = e.target.result as string;
      };
      reader.readAsDataURL(file);
      callback(file);
    }
  };

  return {
    imagePreview,
    imageError,
    handleImageChange,
  };
}
