import { useEffect } from 'react';
import { ICourseOutline } from '../models/course';
import { Language } from '../models/language';
import InputFile from '../ui-kit/InputFile';
import { useScormUpload } from './useScormUpload';

const CourseScormUpload = ({
  formik,
  courseOutlineNamePrefix,
  courseOutline,
}: {
  formik: any;
  courseOutlineNamePrefix: string;
  courseOutline: ICourseOutline<Language>;
}) => {
  const { files, fileKey, fileError, fileCount, handleFileChange } =
    useScormUpload();

  useEffect(() => {
    formik.setFieldValue(
      `${courseOutlineNamePrefix}.learningContentFiles`,
      files,
    );
    formik.setFieldValue(
      `${courseOutlineNamePrefix}.learningContentFileKey`,
      fileKey,
    );
  }, [files, fileKey]);

  return (
    <div>
      {courseOutline.learningContentFile ? (
        <ul className="mx-5 mb-5 list-disc">
          <li>{courseOutline.learningContentFile.key}</li>
        </ul>
      ) : null}

      <InputFile
        name="scormFile"
        label={`SCORM File ${fileCount > 0 ? `(${fileCount} items)` : ''}`}
        allowedExtensions={['application/zip']}
        error={fileError}
        onChange={handleFileChange}
      />
    </div>
  );
};

export default CourseScormUpload;
