import { useState } from 'react';
import jsZIP from 'jszip';
import { AllScormEditions, getScormVersionFromXML } from '../utils/scormAPI';

export function useScormUpload() {
  const [fileError, setFileError] = useState('');
  const [fileCount, setFileCount] = useState(0);
  const [files, setFiles] = useState([]);
  const [fileKey, setFileKey] = useState('');

  const resetFileData = () => {
    setFiles([]);
    setFileKey('');
    setFileError('');
    setFileCount(0);
  };

  const handleFileChange = async (files: FileList, callback: any) => {
    if (files.length <= 0) {
      return;
    }
    resetFileData();
    const file = files[0];
    const zip = await loadZip(file);
    const manifestFile = zip.files['imsmanifest.xml'];
    const courseName = file.name.split('.zip')[0];
    if (!manifestFile) {
      setFileError('courseOutlineForm.imsFileMissing');
      callback(false);
    } else if (!checkScormVersion(await manifestFile.async('string'))) {
      setFileError('courseOutlineForm.imsFileUnknown');
      callback(false);
    } else {
      const keys = Object.keys(zip.files);
      const promises = keys.map(async (key) => {
        const blob = await zip.files[key].async('blob');
        const f = new File([blob], `${courseName}/${key}`);
        return f;
      });
      setFileCount(0);
      const f = await Promise.all(promises);
      setFiles(f);
      setFileCount(f.length);
      setFileKey(`${courseName}/${manifestFile.name}`);
    }
  };

  const checkScormVersion = (imsmanifest: string) => {
    const xmlDoc = new DOMParser().parseFromString(imsmanifest, 'text/html');
    return Object.values(AllScormEditions).includes(
      getScormVersionFromXML(xmlDoc),
    );
  };

  const loadZip = (file: File): Promise<jsZIP> => {
    return new Promise((resolve) => {
      jsZIP.loadAsync(file).then((zip) => {
        resolve(zip);
      });
    });
  };

  return {
    files,
    fileKey,
    fileError,
    fileCount,
    handleFileChange,
    resetFileData,
  };
}
